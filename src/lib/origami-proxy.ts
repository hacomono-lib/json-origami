import clone from 'just-clone'
import type { JsonArray, JsonObject } from 'type-fest'
import type { CommonOption } from '../type'

interface OrigamiOption extends CommonOption {
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

const rawExtractor = Symbol()

interface OrigamiObject<T extends ProxyTarget = ProxyTarget> {
  readonly value: OrigamiProxy<T>
}

type ProxyTarget = JsonObject | JsonArray

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type OrigamiProxy<T extends ProxyTarget = ProxyTarget> = T & Record<string, any> & { [rawExtractor]: { raw: T } }

function isProxyTarget(target: unknown): target is ProxyTarget {
  return typeof target === 'object' && target !== null
}

export function createEmptyProxy(opt: OrigamiOption): OrigamiObject {
  return createProxy({}, opt)
}

export function toProxy<T extends ProxyTarget>(target: T, opt: OrigamiOption): OrigamiObject<T> {
  return createProxy(opt.immutable ? target : clone(target), opt) as OrigamiObject<T>
}

function createProxy(value: ProxyTarget, opt: OrigamiOption): OrigamiObject {
  /**
   * * key: original object
   * * value: origami proxy object
   *
   * caution: export is for testing
   */
  const cache = new Map<ProxyTarget, OrigamiProxy>()

  return {
    value: createProxyInternal(value, opt),
  }

  function createProxyInternal(obj: ProxyTarget, opt: OrigamiOption): OrigamiProxy {
    return new Proxy(obj, {
      /**
       * Treat the following two accesses as equivalent:
       * - proxy.value.a.b.c
       * - proxy.value['a.b.c']
       */

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      get(target, p) {
        // rawExtractor is a special key for accessing raw
        if (p === rawExtractor) {
          return { raw: finalizeRoot(target) }
        }

        if (typeof p !== 'string') {
          return Reflect.get(target, p)
        }

        const { head, tail } = splitKey(p as string, opt)
        const nextRaw: unknown = Reflect.get(target, head)

        if (!isProxyTarget(nextRaw)) {
          return tail ? Reflect.get(target, tail) : nextRaw
        }

        if (!cache.has(nextRaw)) {
          const p = createProxyInternal(nextRaw, opt)
          cache.set(nextRaw, p)
        }

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextProxy = cache.get(nextRaw)!

        return tail ? Reflect.get(nextProxy, tail) : cache.get(nextRaw)
      },

      /**
       * Treat the following two accesses as equivalent:
       * - proxy.value.a.b.c = 'd'
       * - proxy.value['a.b.c'] = 'd'
       */

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      set(target, p, newValue) {
        if (opt.immutable) {
          return false
        }

        if (typeof p !== 'string') {
          return Reflect.set(target, p, newValue)
        }

        const { head, tail, nextHead } = splitKey(p as string, opt)

        if (!tail) {
          return Reflect.set(target, head, newValue)
        }

        let nextValue: unknown = Reflect.get(target, head)
        if (nextValue === undefined) {
          nextValue = typeof nextHead === 'string' ? {} : []
          Reflect.set(target, head, nextValue)
        }

        // transform array to object
        if (Array.isArray(nextValue) && typeof nextHead === 'string') {
          const newNextValue = transformToObjectIfNeeded(nextValue)
          if (nextValue !== newNextValue) {
            nextValue = newNextValue
            Reflect.set(target, head, newNextValue)
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
            Reflect.set(target, head, newNextValue)
          }
        }

        if (!isProxyTarget(nextValue)) {
          return Reflect.set(target, tail, newValue)
        }

        if (!cache.has(nextValue)) {
          const p = createProxyInternal(nextValue, opt)
          cache.set(nextValue, p)
        }

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextProxy = cache.get(nextValue)!

        return Reflect.set(nextProxy, tail, newValue)
      },

      /**
       * Treat the following two accesses as equivalent:
       * - delete proxy.value.a.b.c
       * - delete proxy.value['a.b.c']
       */
      deleteProperty(target, p) {
        if (opt.immutable) {
          return false
        }

        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
        function wrap(callback: () => boolean) {
          const result = callback()
          if (!(result && opt.pruneEmpty)) {
            return result
          }

          const { head } = splitKey(p as string, opt)
          const nextValue = Reflect.get(target, head)

          if (!isProxyTarget(nextValue)) {
            return true
          }

          if (Array.isArray(nextValue)) {
            if (nextValue.every((v) => v === undefined)) {
              return Reflect.deleteProperty(target, head)
            }
          }

          if (typeof nextValue === 'object' && nextValue !== null) {
            if (Object.keys(nextValue).length === 0) {
              return Reflect.deleteProperty(target, head)
            }
          }

          return true
        }

        const { head, tail } = splitKey(p as string, opt)

        if (!tail) {
          return wrap(() => Reflect.deleteProperty(target, head))
        }

        const nextValue: unknown = Reflect.get(target, head)

        if (!isProxyTarget(nextValue)) {
          return wrap(() => Reflect.deleteProperty(target, tail))
        }

        if (!cache.has(nextValue)) {
          const p = createProxyInternal(nextValue, opt)
          cache.set(nextValue, p)
        }

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextProxy = cache.get(nextValue)!
        return wrap(() => Reflect.deleteProperty(nextProxy, tail))
      },
    }) as OrigamiProxy
  }
}

interface SplitKeyResult {
  head: string | number
  nextHead?: string | number
  tail?: string
}

function finalizeRoot(target: object): object {
  const pipe = [transformToArrayIfNeeded, transformToObjectIfNeeded]
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
  if (Array.isArray(target) && !Object.keys(target).every((key) => `${Number.parseInt(key)}` === key)) {
    const newObject = {} as Record<string | number, unknown>
    for (const [k, v] of Object.entries(target)) {
      newObject[k] = v
    }
    return newObject
  }

  return target
}

/**
 * bracket mode:
 * `a.b.c` -> `{ head: 'a', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: 0, tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a', tail: '[0]b.c' }`
 * `[0][1].b.c` -> `{ head: 0, tail: '[1].b.c' }`
 *
 * dot mode:
 * `a.b.c` -> `{ head: 'a', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: '[0]', tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a[0]', tail: 'b.c' }`
 * `[0][1].b.c` -> `{ head: '[0][1]', tail: 'b.c' }`
 */
function splitKey(key: string, { arrayIndex }: OrigamiOption): SplitKeyResult {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  function pickHead(target: string): string | number {
    if (arrayIndex === 'bracket' && target.startsWith('[')) {
      const head = (target.match(/^\[(\d+)\]/) ?? [null, null])[1]
      if (head === null) {
        throw new Error(`Invalid key: ${key}`)
      }
      return Number.parseInt(head)
    }

    if (arrayIndex === 'dot') {
      const head = target.split('.')[0]
      if (head === undefined) {
        throw new Error(`Invalid key: ${key}`)
      }
      const intParsed = Number.parseInt(head)
      return `${intParsed}` === head ? intParsed : head
    }

    const head = target.split(/\.|\[/)[0]
    if (head === undefined) {
      throw new Error(`Invalid key: ${key}`)
    }
    return head
  }

  const head = pickHead(key)

  const tail = (() => {
    const headStr = typeof head === 'string' ? head : arrayIndex === 'bracket' ? `[${head}]` : `${head}`

    const omitHead = key.replace(headStr, '')
    if (omitHead.startsWith('.')) {
      return omitHead.slice(1)
    }

    return omitHead
  })()

  return { head, tail, nextHead: tail ? pickHead(tail) : undefined }
}

export function isOrigamiProxy(target: unknown): target is OrigamiProxy {
  return isProxyTarget(target) && (target as OrigamiProxy)[rawExtractor] !== undefined
}

export function toRaw<T>(target: T): T
export function toRaw<T extends ProxyTarget>(target: OrigamiObject<T>): T
export function toRaw(target: unknown): unknown {
  return isOrigamiProxy(target) ? target[rawExtractor].raw : target
}
