import { createEmptyProxy, toRaw } from './lib'
import { defaultUnfoldOption } from './type'
import type { FixedUnfoldOption, Folded, UnfoldOption, Unfolded } from './type'

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
  const fixedOption = {
    ...defaultUnfoldOption,
    ...option,
  } as FixedUnfoldOption
  const newValue = createEmptyProxy(fixedOption)
  for (const [key, value] of Object.entries(kv)) {
    newValue.value[key] = value
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return toRaw(newValue.value) as any
}
