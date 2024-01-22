import { bench, describe } from 'vitest'
import { fold } from '~/fold'
import { BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, BENCHMARK_TARGET_OBJECT_VALUES, createRandomObject } from './utils'

const iterations = 10

interface TestCaseOption {
  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

function runBench({ objectValues }: TestCaseOption) {
  const objects = Array.from({ length: iterations }, () => createRandomObject({ leafs: objectValues }))
  let index = 0

  bench(`fold (complex object including ${objectValues} values)`, () => {
    const object = objects[index++ % iterations]
    fold(object)
  })
}

describe('fold with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES })
})

describe('fold with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES })
})
