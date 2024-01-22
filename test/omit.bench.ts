import type { JsonObject } from 'type-fest'
import { bench, describe } from 'vitest'
import { fold, omit } from '../src'
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
  percentOfOmitKeys: number

  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

interface TestCase {
  object: JsonObject
  keys: string[]
}

function createTestCase({ percentOfOmitKeys, objectValues }: TestCaseOption): TestCase {
  const object = createRandomObject({ leafs: objectValues })
  const allKeys = Object.keys(fold(object))
  const keys = randomChoices(allKeys, Math.min(objectValues, allKeys.length) * percentOfOmitKeys)
  return { object, keys }
}

function runBench({ percentOfOmitKeys, objectValues }: TestCaseOption) {
  const testCases = Array.from({ length: iterations }, () =>
    createTestCase({
      percentOfOmitKeys,
      objectValues,
    }),
  )

  let index = 0

  bench(`omit (complex object including ${objectValues} values, omit ${percentOfOmitKeys * 100}% of keys)`, () => {
    const currentIndex = index++ % iterations
    const { object, keys } = testCases[currentIndex]
    omit(object, keys)
  })
}

describe('omit with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfOmitKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfOmitKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfOmitKeys: 0.9 })
})

describe('omit with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfOmitKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfOmitKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfOmitKeys: 0.9 })
})
