/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  defaultCommonOption,
  type ArrayIndex,
  type FixedUnfoldOption,
  type UnfoldOption,
  type Folded,
  type Unfolded
} from './type'

/**
 * Unfold a one-level object into a nested object.
 * @param kv
 * @param option
 * @example
 * ```ts
 * const kv = {
 *  a: 1,
 *  'b.c': 2,
 *  'b.d[0]': 3,
 *  'b.d[1]': 4
 * }
 *
 * const unfolded = unfold(kv)
 * // unfolded is
 * // {
 * //   a: 1,
 * //   b: {
 * //     c: 2,
 * //     d: [3, 4]
 * //   }
 * // }
 * ```
 */
export function unfold<KV extends Folded<any>>(kv: KV, option?: UnfoldOption): Unfolded<KV> {
  const fixedOpion = {
    ...defaultCommonOption,
    ...option
  } as FixedUnfoldOption
  validateKeys(kv)

  return unfoldInternal(Object.entries(kv), fixedOpion) as Unfolded<KV>
}

function validateKeys(kv: Folded<any>) {
  for (const key in kv) {
    if (key.startsWith('.') || key.endsWith('.')) {
      throw new Error(`Invalid key ${key}`)
    }
  }
}

const extractHeadIndexMap = {
  dot: (k) => (k.match(/^(\d+)/) ?? [])[1],
  bracket: (k) => (k.match(/^\[(\d+)\]/) ?? [])[1]
} satisfies Record<ArrayIndex, (key: string) => string | undefined>

function extractHeadKey(key: string, { arrayIndex }: FixedUnfoldOption): string | number {
  const indexHead = extractHeadIndexMap[arrayIndex](key)

  if (indexHead !== undefined) {
    return Number.parseInt(indexHead)
  }

  // eslint-disable-next-line no-useless-escape
  const [, match] = key.match(/^([^\.\[]+)/) ?? [null, key]

  return match
}

function omitHeadKey(key: string, opt: FixedUnfoldOption): string {
  const headKey = (() => {
    const k = extractHeadKey(key, opt)
    if (typeof k === 'number') {
      return opt.arrayIndex === 'dot' ? `${k}` : `\\[${k}\\]`
    }
    return k.replace(/\$/g, '\\$')
  })()

  return key.replace(headKey === undefined ? '' : new RegExp(`^${headKey}\\.?`), '')
}

function unfoldInternal(entries: Array<[string, unknown]>, opt: FixedUnfoldOption): unknown {
  if (entries.length <= 0) {
    return {}
  }

  const firstKey = extractHeadKey(entries[0]![0], opt)

  if (firstKey === '') {
    return entries[entries.length - 1]![1]
  }

  if (typeof firstKey === 'number') {
    const maxIndex = entries
      .map(([key]) => extractHeadKey(key, opt) as number)
      .reduce((acc, index) => Math.max(acc, index), 0)

    return new Array(maxIndex + 1).fill(undefined).map((_, index) => {
      const filteredEntries = entries.filter(([key]) => extractHeadKey(key, opt) === index)

      if (filteredEntries.length <= 0) {
        return undefined
      }

      const unfolded = unfoldInternal(
        filteredEntries.map(([key, value]) => [omitHeadKey(key, opt), value]),
        opt
      )

      return unfolded
    })
  }

  const keys = Array.from(new Set(entries.map(([key]) => extractHeadKey(key, opt) as string)))
  return keys.reduce((acc, key) => {
    const filteredEntries = entries.filter(([k]) => extractHeadKey(k, opt) === key)
    const unfolded = unfoldInternal(
      filteredEntries.map(([k, value]) => [omitHeadKey(k, opt), value]),
      opt
    )

    return {
      ...acc,
      [key]: unfolded
    }
  }, {})
}
