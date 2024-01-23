import { toModifier, toRaw } from './lib'
import { type Dictionary, type MoveMap, type Twist, type TwistOption, defaultCommonOption } from './type'

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
  const fixedOption = {
    ...defaultCommonOption,
    ...option,
  }

  const fromSet = new Set(Object.keys(moveMap))

  const src = toModifier(obj, { ...fixedOption, immutable: true })
  const dst = toModifier(obj, { ...fixedOption, pruneNil: true })

  for (const [from, to] of Object.entries(moveMap)) {
    dst.set(to, toRaw(src.get(from)))
    fromSet.delete(to)
  }

  for (const from of fromSet) {
    dst.delete(from)
  }

  return toRaw(dst)
}
