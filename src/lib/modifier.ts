import clone from 'just-clone'
import type { Get } from 'type-fest'
import type { Dictionary } from '~/type'
import { type SplitOption, splitHead, splitTails } from './string'

interface OrigamiOption extends SplitOption {
  /**
   * When a value is deleted, if the result becomes an empty object or array, delete the object or array
   * @default false
   */
  pruneNilInArray?: boolean

  /**
   *
   * @default false
   */
  pruneEmptyLeaf?: boolean

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
   * const proxy = toProxy(target, { arrayIndex: 'bracket' })
   * proxy.get('a.b.c') // 'd'
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
   * const proxy = toProxy(target, { arrayIndex: 'bracket' })
   * proxy.set('a.b.c', 'e')
   * ```
   */
  set<K extends string>(key: K, value: Get<T, K>): boolean
  set(key: string, value: unknown): boolean

  /**
   * delete value by dot-notated key
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
   * const proxy = toProxy(target, { arrayIndex: 'bracket' })
   * proxy.delete('a.b.c') // true
   * ```
   */
  delete<K extends string>(key: K): boolean
  delete(key: string): boolean

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
   * const proxy = toProxy(target, { arrayIndex: 'bracket' })
   * const k = proxy.keys() // ['a.b.c']
   * ```
   */
  keys(): string[]

  get raw(): T
}

interface MaybeRef<T> {
  deref(): T
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
      pruneTargets: this.#findAllPruneTargets(raw),
      absoluteKey: '',
    }

    this.#cacheModifier()
  }

  get #parent() {
    return this.#context.parent
  }

  get #parentKey() {
    return this.#context.parentKey
  }

  get #pruneTargets() {
    return this.#context.pruneTargets
  }

  get #cachesModifier() {
    return this.#context.cacheOriginToModifier
  }

  #findAllPruneTargets(raw: Dictionary): Set<WeakRef<Dictionary>> {
    const set = new Set<WeakRef<Dictionary>>()

    if (this.#opt.immutable || !this.#opt.pruneNilInArray) {
      return set
    }

    // 再帰的にチェックし、 array の ref を set につっこむ
    const warkFindArray = (target: unknown) => {
      if (!isDictionary(target)) {
        return
      }

      if (Array.isArray(target)) {
        set.add(new WeakRef(target))
      }

      for (const value of Object.values(target)) {
        warkFindArray(value)
      }
    }
    warkFindArray(raw)
    return set
  }

  get raw() {
    return this.#raw
  }

  get #isRoot(): boolean {
    return !this.#parent
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
    if (this.#opt.immutable || !this.#opt.pruneNilInArray) {
      return this.#raw
    }

    for (const ref of this.#pruneTargets) {
      const target = ref.deref()
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
        return shorthand.modifier.set(shorthand.lastKey, newValue)
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

    if (!this.#cachesModifier.has(nextValue)) {
      const p = this.#createNext(nextValue, head)
      this.#cachesModifier.set(nextValue, p)
    }

    const nextModifier = this.#getNextModifier(nextValue, head)

    const result = nextModifier.set(rest, newValue)
    this.#afterModify()
    return result
  }

  delete(key: string) {
    if (this.#opt.immutable) {
      return false
    }

    if (this.#isRoot) {
      const shorthand = this.#findShorthand(key)
      if (shorthand) {
        return shorthand.modifier.delete(shorthand.lastKey)
      }
    }

    const { head, rest } = splitHead(key as string, this.#opt)

    if (!rest) {
      delete this.#raw[head as keyof T]
      this.#afterModify()
      return true
    }

    const nextValue: unknown = this.#raw[head as keyof T]

    if (!isDictionary(nextValue)) {
      delete this.#raw[head as keyof T]
      this.#afterModify()
      return true
    }

    if (!this.#cachesModifier.has(nextValue)) {
      const p = this.#createNext(nextValue, head)
      this.#cachesModifier.set(nextValue, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextModifier = this.#cachesModifier.get(nextValue)!
    nextModifier.delete(rest)
    this.#afterModify()
    return true
  }

  #afterModify() {
    const pipe = [transformToObjectIfNeeded, transformToArrayIfNeeded]
    const modified = pipe.reduce((acc, fn) => fn(acc), this.#raw as Dictionary)

    if (this.#opt.pruneEmptyLeaf && this.#parentKey && !this.#opt.immutable && Object.keys(modified).length <= 0) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      delete (this.#parent as any)[this.#parentKey]
      return
    }

    if (modified === this.#raw) {
      return
    }

    if (Array.isArray(modified) && this.#opt.pruneNilInArray && !this.#opt.immutable) {
      this.#pruneTargets.add(new WeakRef(modified))
    }

    this.#raw = modified as T

    if (this.#parent && this.#parentKey) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ;(this.#parent as any)[this.#parentKey] = modified
    }
    return
  }

  keys(): string[] {
    const heads = Object.keys(this.#raw)

    const keys = heads.flatMap((head) => {
      const nextValue = this.#raw[head as keyof T]

      const requiredBracket = this.#opt.arrayIndex === 'bracket' && Array.isArray(this.#raw)

      if (!isDictionary(nextValue)) {
        const resultKey = requiredBracket ? `[${head}]` : head
        return [resultKey]
      }

      const nextModifier = this.#getNextModifier(nextValue, head)

      const nextKeys = nextModifier.keys()

      if (nextKeys.length <= 0) {
        return [requiredBracket ? `[${head}]` : head]
      }

      if (requiredBracket) {
        return nextKeys.map((k) => `[${head}].${k}`)
      }

      return nextKeys.map((k) => (k.startsWith('[') ? `${head}${k}` : `${head}.${k}`))
    })

    return keys
  }

  #getNextModifier<D extends Dictionary>(nextRaw: D, keyOfNextRaw: string | number): ObjectModifier<D> {
    if (this.#cachesModifier.has(nextRaw)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return this.#cachesModifier.get(nextRaw)! as ObjectModifier<D>
    }

    return this.#createNext(nextRaw, keyOfNextRaw)
  }

  #createNext<D extends Dictionary>(target: D, key: string | number): ObjectModifier<D> {
    const requiredBracket = this.#opt.arrayIndex === 'bracket' && Array.isArray(this.#raw)
    const fixedKey = requiredBracket ? `[${key}]` : `${key}`

    return new ObjectModifierImpl(target, this.#opt, {
      ...this.#context,
      parent: this.#raw,
      parentKey: key,
      absoluteKey: this.#context.absoluteKey
        ? `${this.#context.absoluteKey}${fixedKey.startsWith('[') ? '' : '.'}${fixedKey}`
        : `${fixedKey}`,
    })
  }

  #cacheModifier() {
    const { absoluteKey } = this.#context
    if (this.#cachesModifier.has(this.#raw) && this.#cachesModifier.get(this.#raw)?.raw === this.#raw) {
      return
    }

    this.#context.cacheOriginToModifier.set(this.#raw, this)
    this.#context.cacheKeyToModifier.set(absoluteKey, new WeakRef(this))
  }

  #findShorthand(absoluteKey: string): { modifier: ObjectModifier; lastKey: string } | undefined {
    if (!this.#isRoot) {
      return
    }
    const result = splitTails(absoluteKey, this.#opt)
    for (const { tail, remainder } of result) {
      const shorthand = this.#context.cacheKeyToModifier.get(remainder)?.deref()
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

export function toModifier<T extends Dictionary>(target: T, opt: OrigamiOption): ObjectModifier<T> {
  return createModifier(opt.immutable ? target : clone(target), opt) as ObjectModifier<T>
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
