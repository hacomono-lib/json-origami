import { fold } from './fold'
import { unfold } from './unfold'
import { includesKey } from './utils'
import type { Dictionary, DeepKeyOf, PickOption, Omit, Folded } from './type'

/**
 * Returns an object with the specified keys picked from the object.
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
 * const omitted = pick(obj, ['a', 'b.c'])
 * // omitted is
 * // {
 * //   a: 1,
 * //   b: {
 * //     c: 2
 * //   }
 * // }
 * ```
 *
 * @param obj
 * @param keys
 * @param opt
 */
export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: K[],
  opt?: PickOption
): Omit<D, K>

export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: PickOption
): Omit<D, K>

export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: PickOption
): Omit<D, K> {
  const folded = fold(obj)

  const targetKeys = new Set(
    Object.keys(folded).filter((k) => keys.some((key) => includesKey(k, key, opt)))
  )

  const fixedKeyMap = Object.fromEntries(
    Object.entries(folded).filter(([k]) => targetKeys.has(k))
  ) as Folded<Dictionary>

  return unfold(fixedKeyMap, opt) as Dictionary
}
