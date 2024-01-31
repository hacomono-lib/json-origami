import { fold } from './fold'
import {
  type CommonOption,
  type Dictionary,
  type MoveMap,
  type Twist,
  type TwistOption,
  defaultCommonOption,
} from './type'
import { unfold } from './unfold'

/**
 *
 * @param obj
 * @param moveMap
 */
export function twist<D extends Dictionary, M extends MoveMap<D>>(
  obj: D,
  moveMap: M,
  option?: TwistOption,
): Twist<D, M> {
  const folded = fold(obj, option)

  const twisted = Object.fromEntries(
    Object.entries(folded).map(([key, value]) => {
      const found = Object.keys(moveMap).find((k) => includesKey(key, k, option))

      if (found) {
        const newKey = key.replace(found, moveMap[found]!)
        return [newKey, value]
      }

      return [key, value]
    }),
  )

  return unfold(twisted, option)
}

function includesKey(
  origin: string,
  match: string | RegExp,
  { arrayIndex }: CommonOption = defaultCommonOption,
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
