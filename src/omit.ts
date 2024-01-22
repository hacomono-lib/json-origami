import { fold } from './fold'
import type { DeepKeyOf, Dictionary, Folded, Omit, OmitOption } from './type'
import { unfold } from './unfold'
import { includesKey } from './utils'

/**
 * Returns an object with the specified keys removed from the object.
 *
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
 * const omitted = omit(obj, ['a', 'b.c'])
 * // omitted is
 * // {
 * //   b: {
 * //     d: [3, 4]
 * //   }
 * // }
 * ```
 *
 * @param obj
 * @param keys
 * @param opt
 */
export function omit<D extends Dictionary, K extends DeepKeyOf<D>>(obj: D, keys: K[], opt?: OmitOption): Omit<D, K>

/**
 *
 * @param obj
 * @param keys
 * @param opt
 */
export function omit<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: OmitOption,
): Dictionary

export function omit<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: OmitOption,
): Dictionary {
  const folded = fold(obj)

  const targetKeys = new Set(Object.keys(folded).filter((k) => !keys.some((key) => includesKey(k, key, opt))))

  const fixedKeyMap = Object.fromEntries(
    Object.entries(folded).filter(([k]) => targetKeys.has(k)),
  ) as Folded<Dictionary>

  return unfold(fixedKeyMap, opt) as Dictionary
}
