import { bench, describe } from 'vitest'
import { fold } from '~/fold'
import { twist } from '~/twist'
import {
  BENCHMARK_TARGET_LIGHT_OBJECT_VALUES,
  BENCHMARK_TARGET_OBJECT_VALUES,
  createRandomObject,
  randomChoices,
  randomKeyName,
} from './utils'

const iterations = 10

interface TestCaseOption {
  /**
   * twist するキーの割合
   */
  percentOfTwistKeys: number

  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

interface TestCase {
  object: Record<string, unknown>
  twistMap: Record<string, string>
}

function createTestCase({ percentOfTwistKeys, objectValues }: TestCaseOption): TestCase {
  const object = createRandomObject({ leafs: objectValues })
  const allKeys = Object.keys(fold(object))
  const keys = randomChoices(allKeys, Math.min(objectValues, allKeys.length) * percentOfTwistKeys)
  const twistMap = keys.reduce((acc, key) => {
    acc[key] = randomKeyName()
    return acc
  }, {})
  return { object, twistMap }
}

function runBench({ percentOfTwistKeys, objectValues }: TestCaseOption) {
  const testCases = Array.from({ length: iterations }, () =>
    createTestCase({
      percentOfTwistKeys,
      objectValues,
    }),
  )

  let index = 0

  bench(`twist (complex object including ${objectValues} values, twist ${percentOfTwistKeys * 100}% of keys)`, () => {
    const currentIndex = index++ % iterations
    const { object, twistMap } = testCases[currentIndex]
    twist(object, twistMap)
  })
}

describe('twist with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfTwistKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfTwistKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, percentOfTwistKeys: 0.9 })
})

describe('twist with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfTwistKeys: 0.1 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfTwistKeys: 0.5 })
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES, percentOfTwistKeys: 0.9 })
})
