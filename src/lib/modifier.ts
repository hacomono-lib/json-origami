import type { Get } from 'type-fest'
import type { Dictionary, DictionaryLeaf } from '~/type'
import { type KeyOption, splitHead, splitTails } from './string'

interface OrigamiOption extends KeyOption {
  /**
   * When a value is deleted, if the result becomes an empty object or array, delete the object or array
   * @default false
   */
  pruneNilInArray?: boolean

  /**
   * Instead of making it impossible to write, it is faster without deep-cloning
   * @default false
   */
  immutable?: boolean
}

interface ObjectModifier<T extends Dictionary = Dictionary> {
  /**
   * get value by dot-notated key
   *
   * e.g.
   * ```ts
   * const target = {
   *   a: {
   *     b: {
   *       c: 'd',
   *     },
   *   }
   * }
   *
   * const modifier = toModifier(target, { arrayIndex: 'bracket' })
   * modifier.get('a.b.c') // 'd'
   * ```
   */
  get<K extends string>(key: K): Get<T, K>
  get(key: string): unknown

  /**
   * get all value
   */
  get(): T

  /**
   * Since get is usually passed by reference, pruning may not be done properly.
   * Therefore, by calling finalize at the end, the result according to the option is returned.
   */
  finalize(): T

  /**
   * set value by dot-notated key
   *
   * e.g.
   * ```ts
   * const target = {
   *  a: {
   *   b: {
   *    c: 'd',
   *  },
   * }
   *
   * const modifier = toModifier(target, { arrayIndex: 'bracket' })
   * modifier.set('a.b.c', 'e')
   * ```
   */
  set<K extends string>(key: K, value: Get<T, K>): boolean
  set(key: string, value: unknown): boolean

  /**
   * get all keys by dot-notated key
   *
   * e.g.
   * ```ts
   * const target = {
   *   a: {
   *     b: {
   *       c: 'd',
   *     },
   *   }
   * }
   *
   * const modifier = toModifier(target, { arrayIndex: 'bracket' })
   * const k = modifier.keys() // ['a.b.c']
   * ```
   */
  keys(): string[]

  /**
   * get all entries by dot-notated key
   *
   * e.g.
   * ```ts
   * const target = {
   *   a: {
   *     b: {
   *       c: 'd',
   *     }
   *   }
   * }
   *
   * const modifier = toModifier(target, { arrayIndex: 'bracket' })
   * const e = modifier.entries() // [['a.b.c', 'd']]
   * ```
   *
   */
  entries(): [string, DictionaryLeaf][]

  get raw(): T
}

interface ModifierContext {
  /**
   * A WeakMap that caches Object Modifier instances to avoid generating the same object instance again.
   * - key: original object reference
   * - value: Object Modifier instance
   */
  cacheOriginToModifier: WeakMap<Dictionary, ObjectModifier>

  /**
   * A Map that caches key-ObjectModifier pairs.
   * Used to reduce computational complexity.
   */
  cacheKeyToModifier: Map<string, WeakRef<ObjectModifier>>

  /**
   * The parent object of the current object being modified.
   */
  parent?: Dictionary

  /**
   * The key of the parent object of the current object being modified.
   */
  parentKey?: string | number

  /**
   * The absolute key path from the root object to the current object being modified.
   */
  absoluteKey: string

  /**
   * A Set of targets to be pruned. Options such as pruneArray are evaluated last.
   * This Set keeps a reference to the last evaluated target to prevent recursive processing.
   */
  pruneTargets: Set<WeakRef<Dictionary>>
}

/**
 * - key .. original object ref
 * - value .. Object Modifier
 */

class ObjectModifierImpl<T extends Dictionary> implements ObjectModifier<T> {
  #raw: T

  #opt: OrigamiOption

  #context: ModifierContext

  constructor(raw: T, opt: OrigamiOption, context?: ModifierContext) {
    this.#raw = raw
    this.#opt = opt
    this.#context = context ?? {
      cacheOriginToModifier: new WeakMap(),
      cacheKeyToModifier: new Map(),
      pruneTargets: new Set(),
      absoluteKey: '',
    }

    this.#cacheModifier()
  }

  get #parentModifier(): ObjectModifier | undefined {
    if (!this.#context.parent) {
      return undefined
    }

    return this.#context.cacheOriginToModifier.get(this.#context.parent)
  }

  get raw() {
    return this.#raw
  }

  get #isRoot(): boolean {
    return !this.#context.parent
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  get(key?: string): any {
    if (key === undefined) {
      return this.#raw
    }

    const shorthand = this.#findShorthand(key)
    if (shorthand) {
      return shorthand.modifier.get(shorthand.lastKey)
    }

    if (typeof key !== 'string') {
      return this.#raw[key as keyof T]
    }

    const { head, rest } = splitHead(key as string, this.#opt)

    const nextRaw: unknown = this.#raw[head as keyof T]

    if (!isDictionary(nextRaw)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return rest ? (this.#raw as any)[rest] : nextRaw
    }

    const nextModifier = this.#getNextModifier(nextRaw, head)

    return rest ? nextModifier.get(rest) : nextModifier.raw
  }

  finalize(): T {
    if (this.#opt.immutable) {
      return this.#raw
    }

    const { pruneTargets } = this.#context

    for (const targetRef of pruneTargets) {
      const target = targetRef.deref()
      if (!target) {
        continue
      }

      if (Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
          if (target[i] === undefined) {
            target.splice(i, 1)
            i--
          }
        }
      }
    }
    return this.#raw
  }

  set(key: string, newValue: unknown): boolean {
    if (this.#opt.immutable) {
      return false
    }

    if (this.#isRoot) {
      const shorthand = this.#findShorthand(key)
      if (shorthand) {
        shorthand.modifier.set(shorthand.lastKey, newValue)
        this.#afterModify()
        return true
      }
    }

    if (typeof key !== 'string') {
      this.#raw[key as keyof T] = newValue as T[keyof T]
      this.#afterModify()
      return true
    }

    const { head, rest, nextHead } = splitHead(key as string, this.#opt)

    if (!rest) {
      this.#raw[head as keyof T] = newValue as T[keyof T]
      this.#afterModify()
      return true
    }

    let nextValue: unknown = this.#raw[head as keyof T]
    if (nextValue === undefined) {
      nextValue = typeof nextHead === 'string' ? {} : []
      this.#raw[head as keyof T] = nextValue as T[keyof T]
    }

    if (!isDictionary(nextValue)) {
      this.#raw[head as keyof T] = newValue as T[keyof T]
      this.#afterModify()
      return true
    }

    const nextModifier = this.#getNextModifier(nextValue, head)

    const result = nextModifier.set(rest, newValue)
    this.#afterModify()
    return result
  }

  #afterModify() {
    const pipe = [transformToObjectIfNeeded, transformToArrayIfNeeded]
    const modified = pipe.reduce((acc, fn) => fn(acc), this.#raw as Dictionary)

    if (modified === this.#raw) {
      return
    }

    this.#raw = modified as T

    const { parent, parentKey, pruneTargets } = this.#context

    if (parent && parentKey) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ;(parent as any)[parentKey] = modified
    }

    if (Array.isArray(modified) && this.#opt.pruneNilInArray) {
      pruneTargets.add(new WeakRef(modified))
    }

    return
  }

  keys(): string[] {
    return this.entries().map(([k]) => k)
  }

  entries(): [string, DictionaryLeaf][] {
    const heads = Object.keys(this.#raw)

    const entries = heads.flatMap((head): [string, DictionaryLeaf][] => {
      const nextValue = this.#raw[head as keyof T]

      const requiredBracket = this.#opt.arrayIndex === 'bracket' && Array.isArray(this.#raw)

      if (!isDictionary(nextValue)) {
        const resultKey = requiredBracket ? `[${head}]` : head
        return [[resultKey, nextValue]]
      }

      const nextModifier = this.#getNextModifier(nextValue, head)

      const nextEntries = nextModifier.entries()

      if (nextEntries.length <= 0) {
        return [[requiredBracket ? `[${head}]` : head, nextValue]]
      }

      if (requiredBracket) {
        return nextEntries.map(([k, v]) => [`[${head}].${k}`, v])
      }

      return nextEntries.map(([k, v]) => [k.startsWith('[') ? `${head}${k}` : `${head}.${k}`, v])
    })

    return entries
  }

  #getNextModifier<D extends Dictionary>(nextRaw: D, keyOfNextRaw: string | number): ObjectModifier<D> {
    const { cacheOriginToModifier } = this.#context
    if (cacheOriginToModifier.has(nextRaw)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return cacheOriginToModifier.get(nextRaw)! as ObjectModifier<D>
    }

    return this.#createNext(nextRaw, keyOfNextRaw)
  }

  #createNext<D extends Dictionary>(target: D, key: string | number): ObjectModifier<D> {
    const { absoluteKey } = this.#context
    const requiredBracket = this.#opt.arrayIndex === 'bracket' && Array.isArray(this.#raw)
    const fixedKey = requiredBracket ? `[${key}]` : `${key}`

    return new ObjectModifierImpl(target, this.#opt, {
      ...this.#context,
      parent: this.#raw,
      parentKey: key,
      absoluteKey: absoluteKey ? `${absoluteKey}${fixedKey.startsWith('[') ? '' : '.'}${fixedKey}` : `${fixedKey}`,
    })
  }

  #cacheModifier() {
    const { absoluteKey, cacheOriginToModifier, cacheKeyToModifier } = this.#context
    if (cacheOriginToModifier.has(this.#raw) && cacheOriginToModifier.get(this.#raw)?.raw === this.#raw) {
      return
    }

    cacheOriginToModifier.set(this.#raw, this)
    cacheKeyToModifier.set(absoluteKey, new WeakRef(this))

    if (!this.#opt.immutable && this.#opt.pruneNilInArray && Array.isArray(this.#raw)) {
      this.#context.pruneTargets.add(new WeakRef(this.#raw))
    }
  }

  #findShorthand(absoluteKey: string): { modifier: ObjectModifier; lastKey: string } | undefined {
    if (!this.#isRoot) {
      return
    }
    const result = splitTails(absoluteKey, this.#opt)
    const { cacheKeyToModifier } = this.#context
    for (const { tail, remainder } of result) {
      const shorthand = cacheKeyToModifier.get(remainder)?.deref()
      if (shorthand) {
        return {
          modifier: shorthand,
          lastKey: typeof tail === 'number' && this.#opt.arrayIndex === 'bracket' ? `[${tail}]` : `${tail}`,
        }
      }
    }
    return
  }
}

function isDictionary(target: unknown): target is Dictionary {
  return typeof target === 'object' && target !== null
}

export function createEmptyModifier(opt: OrigamiOption): ObjectModifier {
  return createModifier({}, opt)
}

export function toModifier<T extends Dictionary>(target: T, opt: Omit<OrigamiOption, 'immutable'>): ObjectModifier<T> {
  return createModifier(target, { ...opt, immutable: true }) as ObjectModifier<T>
}

function createModifier(value: Dictionary, opt: OrigamiOption): ObjectModifier {
  return new ObjectModifierImpl(value, opt)
}

function transformToArrayIfNeeded(target: Dictionary): Dictionary {
  const entries = Object.entries(target)
  const isNumericKey = (key: string) => `${Number.parseInt(key)}` === key

  if (entries.length > 0 && entries.every(([k]) => isNumericKey(k))) {
    const newArray = []
    for (const [k, v] of entries) {
      newArray[Number.parseInt(k)] = v
    }
    return newArray
  }

  return target
}

function transformToObjectIfNeeded(target: Dictionary): Dictionary {
  const entries = Object.entries(target)
  const isNotNumericKey = (key: string) => `${Number.parseInt(key)}` !== key && key !== ''

  if (Array.isArray(target) && target.length > 0 && entries.some(([k]) => isNotNumericKey(k))) {
    const newObject = {} as Record<string | number, unknown>
    for (const [k, v] of entries) {
      newObject[k] = v
    }
    return newObject
  }

  return target
}

function isModifier(target: unknown): target is ObjectModifier {
  return target instanceof ObjectModifierImpl
}

export function toRaw<T>(target: T): T extends ObjectModifier<infer U> ? U : T {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (isModifier(target) ? target.raw : target) as any
}
