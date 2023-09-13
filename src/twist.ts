import { fold, unfold } from '.'
import type { Dictionary, MoveMap, Twist, FoldOption } from './type'

/**
 *
 * @param obj
 * @param moveMap
 */
export function twist<D extends Dictionary, M extends MoveMap>(
  obj: D,
  moveMap: M,
  option?: FoldOption
): Twist<D, M> {
  const folded = fold(obj, option)

  const twisted = Object.fromEntries(
    Object.entries(folded).map(([key, value]) => {
      const found = Object.keys(moveMap).find((k) => key.startsWith(k))

      if (found) {
        const newKey = key.replace(found, moveMap[found]!)
        return [newKey, value]
      }

      return [key, value]
    })
  )

  return unfold(twisted, option)
}
