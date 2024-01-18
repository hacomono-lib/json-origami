import {
  defaultCommonOption,
  type Dictionary,
  type FoldOption,
  type Folded,
  type Primitive,
  type FixedFoldOption,
  type ArrayIndex
} from './type'

/**
 * Fold an object into a one-level object.
 * @param obj
 * @param option
 * @example
 * ```ts
 * const obj = {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: [3, 4]
 *   }
 * }
 *
 * const folded = fold(obj)
 * // folded is
 * // {
 * //  'a': 1,
 * //  'b.c': 2,
 * //  'b.d[0]': 3,
 * //  'b.d[1]': 4
 * // }
 * ```
 */
export function fold<D extends Dictionary>(obj: D, option?: FoldOption): Folded<D> {
  if (Object.keys(obj).length <= 0) return {}

  return Object.fromEntries(
    flatEntries(option?.keyPrefix ?? '', obj, {
      ...defaultCommonOption,
      ...option
    } as FixedFoldOption)
  ) as Folded<D>
}

const arrayKeyMap = {
  dot: (prefix: string, index: number) => (prefix === '' ? `${index}` : `${prefix}.${index}`),
  bracket: (prefix: string, index: number) => `${prefix}[${index}]`
} satisfies Record<ArrayIndex, (prefix: string, index: number) => string>

function flatEntries(key: string, value: object, opt: FixedFoldOption): Array<[string, Primitive]> {
  if (value === undefined || value === null) return []

  const appendKey = (k: string | number) =>
    typeof k === 'number' ? arrayKeyMap[opt.arrayIndex](key, k) : key === '' ? k : `${key}.${k}`

  if (Array.isArray(value) && value.length > 0) {
    return value.flatMap((v, i) => flatEntries(appendKey(i), v, opt))
  }

  if (typeof value === 'object' && Object.keys(value).length > 0) {
    return Object.entries(value as object).flatMap(([k, v]) => flatEntries(appendKey(k), v, opt))
  }

  return [[key, value]]
}
