import type { Dictionary } from '~/type'
import { createRandomWord, dice, randomChoice } from './random'

const DEFAULT_LEAFS = 1000

interface RandomObjectOption {
  leafs: number
}

export function createRandomObject({ leafs }: RandomObjectOption): Dictionary {
  let leafCount = 0

  if (leafs % 1 !== 0) {
    throw new Error(`leafs must be an integer (input: ${leafs})`)
  }

  const maxLeafs = leafs ?? DEFAULT_LEAFS

  function createNumberLeaf(): number {
    leafCount++
    return leafCount
  }

  function createStringLeaf(): string {
    leafCount++
    return String(leafCount)
  }

  function createBooleanLeaf(): boolean {
    leafCount++
    return leafCount % 2 === 0
  }

  function createObject({ root }: { root?: boolean } = {}): Dictionary {
    const obj: Dictionary = {}

    while ((root || dice(0.6)) && leafCount < maxLeafs) {
      const key = createRandomWord()

      if (!key || key in obj) {
        continue
      }

      const value = createValue()
      obj[key] = value
    }

    if (Object.keys(obj).length <= 0) {
      leafCount++
    }

    return obj
  }

  function createArray(): Dictionary {
    const arr: Dictionary = []

    while (dice(0.3) && leafCount < maxLeafs) {
      const value = createValue()
      arr.push(value)
    }

    if (arr.length <= 0) {
      leafCount++
    }

    return arr
  }

  function createValue(): Dictionary {
    type ValueType = 'number' | 'string' | 'boolean' | 'object' | 'array'

    const map = {
      number: createNumberLeaf,
      string: createStringLeaf,
      boolean: createBooleanLeaf,
      object: createObject,
      array: createArray,
    } satisfies Record<ValueType, () => Dictionary>

    return map[
      randomChoice([
        'number',
        'string',
        'boolean',
        'object',
        // FIXME: array だと twist できないエッジケースがあるため、一時的に無効化する
        // 'array'
      ])
    ]()
  }

  return createObject({ root: true })
}

export function randomKeyName(): string {
  const length = Math.floor(Math.random() * 10) + 1
  const words = Array.from({ length }, createRandomWord)
  return words.join('.')
}
