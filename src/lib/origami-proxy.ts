import clone from 'just-clone'
import type { Get } from 'type-fest'
import type { Dictionary } from '~/type'
import { type SplitOption, splitKey } from './string'

interface OrigamiOption extends SplitOption {
  /**
   * When a value is deleted, if the result becomes an empty object or array, delete the object or array
   * @default false
   */
  pruneEmpty?: boolean

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
  get<K extends string>(key: K): Get<T, K> extends Dictionary ? ObjectModifier<Get<T, K>> : Get<T, K>
  get(key: string): unknown

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

class ObjectModifierImpl<T extends Dictionary> implements ObjectModifier<T> {
  #raw: T

  #opt: OrigamiOption

  #cache: WeakMap<Dictionary, ObjectModifier>

  constructor(raw: T, opt: OrigamiOption, cache?: WeakMap<Dictionary, ObjectModifier>) {
    this.#raw = raw
    this.#opt = opt
    this.#cache = cache ?? new WeakMap()
  }

  get raw() {
    return finalizeRoot(this.#raw) as T
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  get(key: string): any {
    if (typeof key !== 'string') {
      return this.#raw[key as keyof T]
    }

    const { head, tail } = splitKey(key as string, this.#opt)
    const nextRaw: unknown = this.#raw[head as keyof T]

    if (!isModifyTarget(nextRaw)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return tail ? (this.#raw as any)[tail] : nextRaw
    }

    if (!this.#cache.has(nextRaw)) {
      const p = this.#createNext(nextRaw)
      this.#cache.set(nextRaw, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#cache.get(nextRaw)!

    const result = tail ? nextProxy.get(tail) : nextProxy

    return result
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  set(p: string, newValue: unknown): boolean {
    if (this.#opt.immutable) {
      return false
    }

    if (typeof p !== 'string') {
      this.#raw[p as keyof T] = newValue as T[keyof T]
      return true
    }

    const { head, tail, nextHead } = splitKey(p as string, this.#opt)

    if (!tail) {
      this.#raw[head as keyof T] = newValue as T[keyof T]
      return true
    }

    let nextValue: unknown = this.#raw[head as keyof T]
    if (nextValue === undefined) {
      nextValue = typeof nextHead === 'string' ? {} : []
      this.#raw[head as keyof T] = nextValue as T[keyof T]
    }

    // transform array to object
    if (Array.isArray(nextValue) && typeof nextHead === 'string') {
      const newNextValue = transformToObjectIfNeeded(nextValue)
      if (nextValue !== newNextValue) {
        nextValue = newNextValue
        this.#raw[head as keyof T] = newNextValue as T[keyof T]
      }
    }

    // transform object to array
    if (
      typeof nextValue === 'object' &&
      nextValue !== null &&
      !Array.isArray(nextValue) &&
      typeof nextHead === 'number'
    ) {
      const newNextValue = transformToArrayIfNeeded(nextValue)
      if (nextValue !== newNextValue) {
        nextValue = newNextValue
        this.#raw[head as keyof T] = newNextValue as T[keyof T]
      }
    }

    if (!isModifyTarget(nextValue)) {
      this.#raw[head as keyof T] = newValue as T[keyof T]
      return true
    }

    if (!this.#cache.has(nextValue)) {
      const p = this.#createNext(nextValue)
      this.#cache.set(nextValue, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#cache.get(nextValue)!

    return nextProxy.set(tail, newValue)
  }

  delete(key: string) {
    if (this.#opt.immutable) {
      return false
    }

    const { head, tail } = splitKey(key as string, this.#opt)

    if (!tail) {
      return this.#deleteWrap(key, () => delete this.#raw[head as keyof T])
    }

    const nextValue: unknown = this.#raw[head as keyof T]

    if (!isModifyTarget(nextValue)) {
      return this.#deleteWrap(key, () => delete this.#raw[head as keyof T])
    }

    if (!this.#cache.has(nextValue)) {
      const p = this.#createNext(nextValue)
      this.#cache.set(nextValue, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#cache.get(nextValue)!
    return this.#deleteWrap(key, () => nextProxy.delete(tail))
  }

  /**
   * After deleting the value, perform the following processing
   * - If the object after deleting the value becomes empty, delete the object
   *
   */
  #deleteWrap(key: string, runDelete: () => boolean) {
    const result = runDelete()
    if (!(result && this.#opt.pruneEmpty)) {
      return result
    }

    const { head } = splitKey(key as string, this.#opt)
    const nextValue = this.#raw[head as keyof T]

    if (!isModifyTarget(nextValue)) {
      return true
    }

    if (Array.isArray(nextValue)) {
      if (nextValue.every((v) => v === undefined)) {
        return delete this.#raw[head as keyof T]
      }
    }

    if (typeof nextValue === 'object' && nextValue !== null) {
      if (Object.keys(nextValue).length === 0) {
        return delete this.#raw[head as keyof T]
      }
    }

    return true
  }

  keys(): string[] {
    const heads = Object.keys(this.#raw)

    const keys = heads.flatMap((head) => {
      const nextValue = this.#raw[head as keyof T]

      const requiredBracket = this.#opt.arrayIndex === 'bracket' && Array.isArray(this.#raw)

      if (!isModifyTarget(nextValue)) {
        return [requiredBracket ? `[${head}]` : head]
      }

      if (!this.#cache.has(nextValue)) {
        const p = this.#createNext(nextValue)
        this.#cache.set(nextValue, p)
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const nextProxy = this.#cache.get(nextValue)!

      const nextKeys = nextProxy.keys()

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

  #createNext(target: Dictionary): ObjectModifier {
    return new ObjectModifierImpl(target, this.#opt, this.#cache)
  }
}

function isModifyTarget(target: unknown): target is Dictionary {
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

function finalizeRoot(target: object): object {
  const pipe = [transformToObjectIfNeeded, transformToArrayIfNeeded]
  return pipe.reduce((acc, fn) => fn(acc), target)
}

function transformToArrayIfNeeded(target: object): object {
  const keys = Object.keys(target)
  if (keys.length > 0 && keys.every((key) => `${Number.parseInt(key)}` === key)) {
    const newArray = []
    for (const [k, v] of Object.entries(target)) {
      newArray[Number.parseInt(k)] = v
    }
    return newArray
  }

  return target
}

function transformToObjectIfNeeded(target: object): object {
  if (Array.isArray(target) && target.length > 0) {
    const newObject = {} as Record<string | number, unknown>
    for (const [k, v] of Object.entries(target)) {
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
