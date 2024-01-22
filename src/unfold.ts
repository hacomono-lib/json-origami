import { defaultUnfoldOption } from './type'
import type { ArrayIndex, FixedUnfoldOption, Folded, UnfoldOption, Unfolded } from './type'

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
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function unfold<Kv extends Folded<any>>(kv: Kv, option?: UnfoldOption): Unfolded<Kv> {
  const fixedOpion = {
    ...defaultUnfoldOption,
    ...option,
  } as FixedUnfoldOption
  validateKeys(kv)

  return unfoldInternal(Object.entries(kv), fixedOpion) as Unfolded<Kv>
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function validateKeys(kv: Folded<any>) {
  for (const key in kv) {
    if (key.startsWith('.') || key.endsWith('.')) {
      throw new Error(`Invalid key ${key}`)
    }
  }
}

const extractHeadIndexMap = {
  dot: (k) => (k.match(/^(\d+)/) ?? [])[1],
  bracket: (k) => (k.match(/^\[(\d+)\]/) ?? [])[1],
} satisfies Record<ArrayIndex, (key: string) => string | undefined>

function extractHeadKey(key: string, { arrayIndex }: FixedUnfoldOption): string | number {
  const indexHead = extractHeadIndexMap[arrayIndex](key)

  if (indexHead !== undefined) {
    return Number.parseInt(indexHead)
  }

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

function unfoldInternal(entries: [string, unknown][], opt: FixedUnfoldOption): unknown {
  if (entries.length <= 0) {
    return {}
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const firstKey = extractHeadKey(entries[0]![0], opt)

  if (firstKey === '') {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return entries[entries.length - 1]![1]
  }

  if (typeof firstKey === 'number') {
    const maxIndex = entries
      .map(([key]) => extractHeadKey(key, opt) as number)
      .reduce((acc, index) => Math.max(acc, index), 0)

    const array = new Array(maxIndex + 1).fill(undefined).map((_, index) => {
      const filteredEntries = entries.filter(([key]) => extractHeadKey(key, opt) === index)

      if (filteredEntries.length <= 0) {
        return undefined
      }

      const unfolded = unfoldInternal(
        filteredEntries.map(([key, value]) => [omitHeadKey(key, opt), value]),
        opt,
      )

      return unfolded
    })

    if (opt.pruneArray) {
      return array.filter((v) => v !== undefined)
    }

    return array
  }

  const keys = Array.from(new Set(entries.map(([key]) => extractHeadKey(key, opt) as string)))
  return keys.reduce((acc, key) => {
    const filteredEntries = entries.filter(([k]) => extractHeadKey(k, opt) === key)
    const unfolded = unfoldInternal(
      filteredEntries.map(([k, value]) => [omitHeadKey(k, opt), value]),
      opt,
    )

    return {
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      ...acc,
      [key]: unfolded,
    }
  }, {})
}
