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
  const copyKeys: string[] = []

  const src = toModifier(obj, { ...fixedOption, immutable: true })
  const dist = createEmptyModifier(fixedOption)

  const srcKeys = src.keys()

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
