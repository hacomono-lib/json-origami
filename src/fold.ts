import { toModifier } from './lib'
import { type Dictionary, type FixedFoldOption, type FoldOption, type Folded, defaultCommonOption } from './type'

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
  if (Object.keys(obj).length <= 0) {
    return {}
  }

  const fixedOption = {
    ...defaultCommonOption,
    ...option,
  } as FixedFoldOption

  const modifier = toModifier(obj, fixedOption)

  const result = {} as Folded<D>

  for (const [key, value] of modifier.entries()) {
    result[fixKey(fixedOption, key)] = value
  }

  return result
}

function fixKey(option: FixedFoldOption, key: string) {
  if (option.keyPrefix) {
    return key.startsWith('[') ? `${option.keyPrefix}${key}` : `${option.keyPrefix}.${key}`
  }
  return key
}
