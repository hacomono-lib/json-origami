import { createEmptyProxy, toProxy, toRaw } from './lib'
import { type DeepKeyOf, type Dictionary, type PickOption, defaultCommonOption } from './type'

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
export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(obj: D, keys: K[], opt?: PickOption): Omit<D, K>

export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: PickOption,
): Omit<D, K>

export function pick<D extends Dictionary, K extends DeepKeyOf<D>>(
  obj: D,
  keys: Array<K | RegExp>,
  opt?: PickOption,
): Omit<D, K> {
  const fixedOption = {
    ...defaultCommonOption,
    ...opt,
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const proxy = toProxy(obj as any, fixedOption)
  const newValue = createEmptyProxy(fixedOption)

  for (const key of keys) {
    newValue.value[key] = proxy.value[key]
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return toRaw(newValue.value) as any
}
