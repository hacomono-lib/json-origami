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

  const src = toModifier(obj, fixedOption)

  const regexpKeyss = keys.filter((key): key is RegExp => key instanceof RegExp)

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const fixedKeys: string[] = (() => {
    if (regexpKeyss.length <= 0) {
      return keys as string[]
    }

    const stringKeys = keys.filter((key): key is string => typeof key === 'string')
    const keyset = new Set<string>(stringKeys)
    const srcKeys = src.keys()

    for (const key of regexpKeyss) {
      if (key instanceof RegExp) {
        for (const k of srcKeys) {
          if (key.test(k)) {
            keyset.add(k)
          }
        }
      }
    }
    return [...keyset]
  })()

  const dist = createEmptyModifier(fixedOption)
  for (const key of fixedKeys) {
    dist.set(key, src.get(key))
  }

  return dist.finalize()
}
