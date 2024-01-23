import { toProxy, toRaw } from './lib'
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

  const src = toProxy(obj, { ...fixedOption, immutable: true })
  const dst = toProxy(obj, { ...fixedOption, pruneEmpty: true })

  for (const [from, to] of Object.entries(moveMap)) {
    dst.value[to] = src.value[from]
    fromSet.delete(to)
  }

  for (const from of fromSet) {
    delete dst.value[from]
  }

  return toRaw(dst.value)
}
