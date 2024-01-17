import { bench } from 'vitest'
import { createRandomObject, BENCHMARK_TARGET_LIGHT_OBJECT_VALUES } from './utils'
import { unfold } from '../src/unfold'
import { fold } from '../src/fold'

const object = fold(createRandomObject({ leafs: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES }))

bench(
  `unfold (complex object including ${BENCHMARK_TARGET_LIGHT_OBJECT_VALUES} values)`,
  () => {
    unfold(object)
  }
)
