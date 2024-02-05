import { createEmptyModifier, startsKeyWith, toModifier } from './lib'
import {
  type Dictionary,
  type DictionaryLeaf,
  type MoveMap,
  type Twist,
  type TwistOption,
  defaultCommonOption,
} from './type'

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

  const srcEntries = src.entries()
  const copyEntries: [string, DictionaryLeaf][] = []

  for (const [srcKey, srcValue] of srcEntries) {
    const foundFromKey = fromKeys.find((fromKey) => startsKeyWith(srcKey, fromKey, fixedOption))
    if (foundFromKey) {
      const tail = srcKey.slice(foundFromKey.length)
      const fixedTail = tail.startsWith('.') ? tail.slice(1) : tail
      const toKey = `${moveMap[foundFromKey]}${fixedTail !== '' ? '.' : ''}${fixedTail}`
      copyEntries.push([toKey, srcValue])
    } else {
      copyEntries.push([srcKey, srcValue])
    }
  }

  for (const [copyKey, copyValue] of copyEntries) {
    dist.set(copyKey, copyValue)
  }

  return dist.finalize()
}
