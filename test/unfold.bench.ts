import { bench, describe } from 'vitest'
import { fold } from '~/fold'
import { unfold } from '~/unfold'
import { BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, BENCHMARK_TARGET_OBJECT_VALUES, createRandomObject } from './utils'

interface TestCaseOption {
  /**
   * 生成するオブジェクトの値の数
   */
  objectValues: number
}

function runBench({ objectValues }: TestCaseOption) {
  const object = fold(createRandomObject({ leafs: objectValues }))

  bench(`unfold (complex object including ${objectValues} values)`, () => {
    unfold(object)
  })
}

describe('unfold with light object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES })
})

describe('unfold with heavy object', () => {
  runBench({ objectValues: BENCHMARK_TARGET_OBJECT_VALUES })
})
