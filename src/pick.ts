import { createEmptyModifier, toModifier } from './lib'
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

export function pick(obj: Dictionary, keys: Array<string | RegExp>, opt?: PickOption): Dictionary {
  const fixedOption = {
    ...defaultCommonOption,
    ...opt,
  }

  const src = toModifier(obj, { ...fixedOption, immutable: true })
  const dist = createEmptyModifier(fixedOption)

  for (const key of keys) {
    if (typeof key === 'string') {
      dist.set(key, src.get(key))
    }

    if (key instanceof RegExp) {
      for (const k of src.keys()) {
        if (key.test(k)) {
          dist.set(k, src.get(k))
        }
      }
    }
  }

  return dist.finalize()
}
