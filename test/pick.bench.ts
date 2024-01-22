import type { JsonObject } from 'type-fest'
import { bench, describe } from 'vitest'
import { fold, pick } from '../src'
import {
  BENCHMARK_TARGET_LIGHT_OBJECT_VALUES,
  BENCHMARK_TARGET_OBJECT_VALUES,
  createRandomObject,
  randomChoices,
} from './utils'

const iterations = 10

interface TestCaseOption {
  /**
   * pick するキーの割合
   */
  percentOfPickKeys: number

  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

interface TestCase {
  object: JsonObject
  keys: string[]
}

function createTestCase({ percentOfPickKeys, objectValues }: TestCaseOption): TestCase {
  const object = createRandomObject({ leafs: objectValues })
  const allKeys = Object.keys(fold(object))
  const keys = randomChoices(allKeys, Math.min(objectValues, allKeys.length) * percentOfPickKeys)
  return { object, keys }
}

function runBench({ percentOfPickKeys, objectValues }: TestCaseOption) {
  const testCases = Array.from({ length: iterations }, () =>
    createTestCase({
      percentOfPickKeys,
      objectValues,
    }),
  )

  let index = 0

  bench(`pick (complex object including ${objectValues} values, pick ${percentOfPickKeys * 100}% of keys)`, () => {
    const currentIndex = index++ % iterations
    const { object, keys } = testCases[currentIndex]
    pick(object, keys)
  })
}

describe('pick with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfPickKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfPickKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfPickKeys: 0.9 })
})

describe('pick with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfPickKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfPickKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfPickKeys: 0.9 })
})
