/* eslint-disable @typescript-eslint/no-explicit-any */
import { createEmptyProxy, toRaw } from './lib/origami-proxy'
import { defaultUnfoldOption } from './type'
import type { FixedUnfoldOption, UnfoldOption, Folded, Unfolded } from './type'

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
  const fixedOption = {
    ...defaultUnfoldOption,
    ...option
  } as FixedUnfoldOption
  const newValue = createEmptyProxy(fixedOption)
  for (const [key, value] of Object.entries(kv)) {
    newValue.value[key] = value
  }

  return toRaw(newValue.value) as any
}
