import { createEmptyModifier, startsKeyWith, toModifier } from './lib'
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

  const fromKeys = Object.keys(moveMap)

  const src = toModifier(obj, fixedOption)
  const dist = createEmptyModifier({ ...fixedOption, pruneNilInArray: option?.pruneArray })

  const srcKeys = src.keys()
  const copyKeys: string[] = []

  for (const srcKey of srcKeys) {
    const needCopy = fromKeys.every((fromKey) => !startsKeyWith(srcKey, fromKey, fixedOption))
    if (needCopy) {
      copyKeys.push(srcKey)
    }
  }

  for (const [from, to] of Object.entries(moveMap)) {
    dist.set(to, src.get(from))
  }

  for (const key of copyKeys) {
    dist.set(key, src.get(key))
  }

  return dist.finalize()
}
