import { defaultCommonOption, type CommonOption } from './type'

/**
 * Check if the key (origin) to be inspected contains the key.
 *
 * e.g.
 * ```ts
 * includesKey("foo.bar.baz", "foo", { arrayIndex: "bracket" }) // => true
 * includesKey("foo.bar.baz", "foo.bar", { arrayIndex: "bracket" }) // => true
 * includesKey("foo.bar.baz", "foo.bar.baz", { arrayIndex: "bracket" }) // => true
 * includesKey("foo.bar.baz", "f", { arrayIndex: "bracket" }) // => false
 * ```
 * @param origin
 * @param match
 * @param option
 */
export function includesKey(
  origin: string,
  match: string | RegExp,
  { arrayIndex }: CommonOption = defaultCommonOption
): boolean {
  if (match instanceof RegExp) return match.test(origin)

  const split = (key: string): string[] => {
    const fixedKey = arrayIndex === 'bracket' ? key.replace(/\[(\w+)\]/g, '.$1') : key
    return fixedKey.split('.')
  }

  const originKeys = split(origin)
  const keys = split(match)

  if (keys.length > originKeys.length) return false

  const targets = originKeys.slice(0, keys.length)
  return targets.join('.') === keys.join('.')
}
