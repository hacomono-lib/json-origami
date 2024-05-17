import { bench, describe } from 'vitest'
import { fold } from '~/fold'
import { has } from '~/has'
import type { Dictionary } from '~/type'
import {
  BENCHMARK_TARGET_LIGHT_OBJECT_VALUES,
  BENCHMARK_TARGET_OBJECT_VALUES,
  createRandomObject,
  randomChoices,
} from './utils'

const iterations = 10

interface TestCaseOption {
  /**
   * omit するキーの割合
   */
  percentOfCheckKeys: number

  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

interface TestCase {
  object: Dictionary
  keys: string[]
}

function createTestCase({ percentOfCheckKeys, objectValues }: TestCaseOption): TestCase {
  const object = createRandomObject({ leafs: objectValues })
  const allKeys = Object.keys(fold(object))
  const keys = randomChoices(allKeys, Math.min(objectValues, allKeys.length) * percentOfCheckKeys)
  return { object, keys }
}

function runBench({ percentOfCheckKeys, objectValues }: TestCaseOption) {
  const testCases = Array.from({ length: iterations }, () =>
    createTestCase({
      percentOfCheckKeys,
      objectValues,
    }),
  )

  let index = 0

  bench(`has (complex object including ${objectValues} values, check ${percentOfCheckKeys * 100}% of keys)`, () => {
    const currentIndex = index++ % iterations
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const { object, keys } = testCases[currentIndex]!

    for (const key of keys) {
      has(object, key)
    }
  })
}

describe('has with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfCheckKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfCheckKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfCheckKeys: 0.9 })
})

describe('has with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfCheckKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfCheckKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfCheckKeys: 0.9 })
})
