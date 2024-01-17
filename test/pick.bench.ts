import { bench } from 'vitest'
import { createRandomObject, randomChoices, BENCHMARK_TARGET_LIGHT_OBJECT_VALUES } from './utils'
import { fold } from '../src/fold'
import { pick } from '../src/pick'

const object = createRandomObject({ leafs: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES })
const keys = Object.keys(fold(object))

const keys10 = randomChoices(keys, Math.min(BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, keys.length) * 0.1)
const keys90 = randomChoices(keys, Math.min(BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, keys.length) * 0.9)

bench(
  `pick (complex object including ${BENCHMARK_TARGET_LIGHT_OBJECT_VALUES} values, target keys ${keys10.length})`,
  () => {
    pick(object, keys10)
  }
)

bench(
  `pick (complex object including ${BENCHMARK_TARGET_LIGHT_OBJECT_VALUES} values, target keys ${keys90.length})`,
  () => {
    pick(object, keys90)
  }
)
