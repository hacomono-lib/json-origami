import { bench } from 'vitest'
import { createRandomObject, randomChoices, randomKeyName, BENCHMARK_TARGET_LIGHT_OBJECT_VALUES } from './utils'
import { fold } from '../src/fold'
import { twist } from '../src/twist'

const object = createRandomObject({ leafs: BENCHMARK_TARGET_LIGHT_OBJECT_VALUES })
const keys = Object.keys(fold(object))

const keys10 = randomChoices(keys, Math.min(BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, keys.length) * 0.1)
const twistMap10 = keys10.reduce((acc, key) => {
  acc[key] = randomKeyName()
  return acc
}, {})

const keys90 = randomChoices(keys, Math.min(BENCHMARK_TARGET_LIGHT_OBJECT_VALUES, keys.length) * 0.9)
const twistMap90 = keys90.reduce((acc, key) => {
  acc[key] = randomKeyName()
  return acc
}, {})

bench(
  `twist (complex object including ${BENCHMARK_TARGET_LIGHT_OBJECT_VALUES} values, target twist map ${keys10.length})`,
  () => {
    twist(object, twistMap10)
  }
)

bench(
  `twist (complex object including ${BENCHMARK_TARGET_LIGHT_OBJECT_VALUES} values, target twist map ${keys90.length})`,
  () => {
    twist(object, twistMap90)
  }
)
