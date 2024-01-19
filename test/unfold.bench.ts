import { bench, describe } from 'vitest'
import {
  createRandomObject,
  BENCHMARK_TARGET_LIGHT_OBJECT_VALUES,
  BENCHMARK_TARGET_OBJECT_VALUES
} from './utils'
import { unfold } from '../src/unfold'
import { fold } from '../src/fold'

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
