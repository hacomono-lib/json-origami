import { toModifier } from './lib'
import { type Dictionary, type FixedHasOption, type HasOption, defaultHasOption } from './type'

/**
 * Check if an object has a key.
 * @param obj
 * @param key
 * @param option
 * @returns
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
 * has(obj, 'a') // true
 * has(obj, 'b.c') // true
 * has(obj, 'b.d[0]') // true
 * has(obj, 'd') // true
 * ```
 */
export function has<D extends Dictionary>(obj: D, key: string, option?: HasOption): boolean {
  if (Object.keys(obj).length <= 0) {
    return false
  }

  const fixedOption = {
    ...defaultHasOption,
    ...option,
  } as FixedHasOption

  return toModifier(obj, fixedOption).has(key)
}
