/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-statements */
/* eslint-disable prefer-const */
/* eslint-disable max-lines-per-function */
import clone from 'just-clone'
import type { JsonArray, JsonObject } from 'type-fest'
import type { CommonOption } from '../type'

interface OrigamiOption extends CommonOption {
  pruneArray?: boolean
}

/**
 * * export is for testing
 */
export const origamiMeta = Symbol()

const rawExtractor = Symbol()

interface OrigamiObject<T extends ProxyTarget = ProxyTarget> {
  readonly raw: T
  readonly value: OrigamiProxy<T>
  readonly [origamiMeta]: OrigamiMeta
}

interface OrigamiMeta {
  cache: WeakMap<ProxyTarget, OrigamiObject>
}

type ProxyTarget = JsonObject | JsonArray

type OrigamiProxy<T extends ProxyTarget = ProxyTarget> = T &
  Record<string, any> & { [rawExtractor]: { raw: T } }

function isProxyTarget(target: unknown): target is ProxyTarget {
  return typeof target === 'object' && target !== null
}

export function createEmptyProxy(opt: OrigamiOption): OrigamiObject {
  return createProxy({}, opt)
}

export function toProxy<T extends ProxyTarget>(target: T, opt: OrigamiOption): OrigamiObject<T> {
  return createProxy(clone(target), opt)
}

function createProxy<T extends ProxyTarget>(value: T, opt: OrigamiOption): OrigamiObject<T> {
  /**
   * * key: original object
   * * value: origami proxy object
   *
   * caution: export is for testing
   */
  const cache = new WeakMap<ProxyTarget, OrigamiProxy>()

  const root = {
    get raw() {
      return value
    },
    value,
    get [origamiMeta]() {
      return {
        cache
      }
    }
  }

  return createProxyInternal(root, opt) as any

  /**
   *
   */
  function createProxyInternal<T extends ProxyTarget>(obj: T, opt: OrigamiOption): OrigamiProxy<T> {
    return new Proxy(obj, {
      /**
       * Treat the following two accesses as equivalent:
       * - proxy.a.b.c
       * - proxy['a.b.c']
       */
      get(target, p) {
        // avoiding root access
        if (origamiMeta in target && ['raw', origamiMeta].includes(p)) {
          return Reflect.get(target, p)
        }

        // rawExtractor is a special key for accessing raw
        if (p === rawExtractor) {
          return { raw: target }
        }

        if (typeof p !== 'string') {
          // eslint-disable-next-line prefer-rest-params
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

        const nextProxy = cache.get(nextRaw)!

        return tail ? Reflect.get(nextProxy, tail) : cache.get(nextRaw)
      },

      /**
       * Treat the following two accesses as equivalent:
       * - proxy.a.b.c = 'd'
       * - proxy['a.b.c'] = 'd'
       */
      set(target, p, newValue) {
        // avoiding root access
        if (origamiMeta in target && p !== 'value') {
          return false
        }

        if (typeof p !== 'string') {
          // eslint-disable-next-line prefer-rest-params
          return Reflect.set(target, p, newValue)
        }

        const { head, tail, nextHead } = splitKey(p as string, opt)

        if (!tail) {
          return Reflect.set(target, head, newValue)
        }

        let nextRaw: unknown = Reflect.get(target, head)
        if (nextRaw === undefined) {
          nextRaw = typeof nextHead === 'string' ? {} : Array(nextHead! + 1)
          Reflect.set(target, head, nextRaw)
        }

        if (Array.isArray(nextRaw) && typeof nextHead === 'string') {
          const newNextRaw = nextRaw.reduce((acc, cur, i) => ({ ...acc, [i]: cur }), {})
          nextRaw = newNextRaw
          Reflect.set(target, head, newNextRaw)
        }

        if (!isProxyTarget(nextRaw)) {
          return Reflect.set(target, tail, newValue)
        }

        if (!cache.has(nextRaw)) {
          const p = createProxyInternal(nextRaw, opt)
          cache.set(nextRaw, p)
        }

        const nextProxy = cache.get(nextRaw)!

        return Reflect.set(nextProxy, tail, newValue)
      }
    }) as OrigamiProxy<T>
  }
}

interface SplitKeyResult {
  head: string | number
  nextHead?: string | number
  tail?: string
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
    const headStr =
      typeof head === 'string' ? head : arrayIndex === 'bracket' ? `[${head}]` : `${head}`

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
