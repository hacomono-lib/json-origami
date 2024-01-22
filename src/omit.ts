import { toProxy, toRaw } from './lib'
import { type DeepKeyOf, type Dictionary, type Omit, type OmitOption, defaultCommonOption } from './type'

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
  const fixedOption = {
    ...defaultCommonOption,
    ...opt,
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const proxy = toProxy(obj as any, { ...fixedOption, pruneEmpty: true })

  for (const key of keys) {
    delete proxy.value[key]
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return toRaw(proxy.value) as any
}
