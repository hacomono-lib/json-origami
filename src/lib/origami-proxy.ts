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

type ProxyTarget = Dictionary

export interface OrigamiProxy<T extends ProxyTarget = ProxyTarget> {
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
   *
   * @param key
   */
  get<K extends string>(key: K): Get<T, K> extends ProxyTarget ? OrigamiProxy<Get<T, K>> : Get<T, K>
  get(key: string): unknown

  set<K extends string>(key: K, value: Get<T, K>): boolean
  set(key: string, value: unknown): boolean

  delete<K extends string>(key: K): boolean
  delete(key: string): boolean

  keys(): string[]

  get raw(): T
}

interface CacheSet {
  /**
   * Cache of proxy object by origin object
   * - key: origin object
   * - value: proxy object
   */
  proxyByOrigin: WeakMap<ProxyTarget, OrigamiProxy>

  /**
   * Cache of proxy object by dot-notated key
   * - key: dot-notated key
   * - value: proxy object
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  proxyByKey: Map<string | symbol, WeakRef<any>>
}

class OrigamiProxyImpl<T extends ProxyTarget> implements OrigamiProxy<T> {
  #raw: T

  #opt: OrigamiOption

  #caches: CacheSet

  constructor(raw: T, opt: OrigamiOption, caches?: CacheSet) {
    this.#raw = raw
    this.#opt = opt
    this.#caches = caches ?? {
      proxyByOrigin: new WeakMap(),
      proxyByKey: new Map(),
    }
  }

  get raw() {
    return this.#finalizeRoot(this.#raw) as T
  }

  #finalizeRoot(target: object): object {
    const pipe = [transformToArrayIfNeeded, transformToObjectIfNeeded]
    return pipe.reduce((acc, fn) => fn(acc), target)
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  get(key: string): any {
    if (this.#caches.proxyByKey.has(key)) {
      const cached = this.#caches.proxyByKey.get(key)
      if (cached !== undefined && cached.deref() !== undefined) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        return cached.deref()!
      }
    }

    if (typeof key !== 'string') {
      return Reflect.get(this.#raw, key)
    }

    const { head, tail } = splitKey(key as string, this.#opt)
    const nextRaw: unknown = this.#raw[head as keyof T]

    if (!isProxyTarget(nextRaw)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return tail ? (this.#raw as any)[tail] : nextRaw
    }

    if (!this.#caches.proxyByOrigin.has(nextRaw)) {
      const p = this.#createNext(nextRaw)
      this.#caches.proxyByOrigin.set(nextRaw, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#caches.proxyByOrigin.get(nextRaw)!

    const result = tail ? nextProxy.get(tail) : nextProxy

    if (result instanceof OrigamiProxyImpl) {
      this.#caches.proxyByKey.set(key, new WeakRef(result))
    }

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

    let nextValue: unknown = Reflect.get(this.#raw, head)
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

    if (!isProxyTarget(nextValue)) {
      this.#raw[head as keyof T] = newValue as T[keyof T]
      return true
    }

    if (!this.#caches.proxyByOrigin.has(nextValue)) {
      const p = this.#createNext(nextValue)
      this.#caches.proxyByOrigin.set(nextValue, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#caches.proxyByOrigin.get(nextValue)!

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

    const nextValue: unknown = Reflect.get(this.#raw, head)

    if (!isProxyTarget(nextValue)) {
      return this.#deleteWrap(key, () => delete this.#raw[head as keyof T])
    }

    if (!this.#caches.proxyByOrigin.has(nextValue)) {
      const p = this.#createNext(nextValue)
      this.#caches.proxyByOrigin.set(nextValue, p)
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const nextProxy = this.#caches.proxyByOrigin.get(nextValue)!
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

    if (!isProxyTarget(nextValue)) {
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

      if (!isProxyTarget(nextValue)) {
        return [requiredBracket ? `[${head}]` : head]
      }

      if (!this.#caches.proxyByOrigin.has(nextValue)) {
        const p = this.#createNext(nextValue)
        this.#caches.proxyByOrigin.set(nextValue, p)
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const nextProxy = this.#caches.proxyByOrigin.get(nextValue)!

      const nextKeys = nextProxy.keys()

      if (requiredBracket) {
        return nextKeys.map((k) => `[${head}].${k}`)
      }

      return nextKeys.map((k) => (k.startsWith('[') ? `${head}${k}` : `${head}.${k}`))
    })

    return keys
  }

  #createNext(target: ProxyTarget): OrigamiProxy {
    return new OrigamiProxyImpl(target, this.#opt, this.#caches)
  }
}

function isProxyTarget(target: unknown): target is ProxyTarget {
  return typeof target === 'object' && target !== null
}

export function createEmptyProxy(opt: OrigamiOption): OrigamiProxy {
  return createProxy({}, opt)
}

export function toProxy<T extends ProxyTarget>(target: T, opt: OrigamiOption): OrigamiProxy<T> {
  return createProxy(opt.immutable ? target : clone(target), opt) as OrigamiProxy<T>
}

function createProxy(value: ProxyTarget, opt: OrigamiOption): OrigamiProxy {
  return new OrigamiProxyImpl(value, opt)
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
  if (Array.isArray(target) && !Object.keys(target).every((key) => `${Number.parseInt(key)}` === key)) {
    const newObject = {} as Record<string | number, unknown>
    for (const [k, v] of Object.entries(target)) {
      newObject[k] = v
    }
    return newObject
  }

  return target
}

export function isOrigamiProxy(target: unknown): target is OrigamiProxy {
  return target instanceof OrigamiProxyImpl
}

export function toRaw<T>(target: T): T extends OrigamiProxy<infer U> ? U : T {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (isOrigamiProxy(target) ? target.raw : target) as any
}
