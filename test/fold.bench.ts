import { bench } from 'vitest'
import { createRandomObject, BENCHMAKR_TARGET_OBJECT_VALUES } from './utils'
import { fold } from '../src/fold'

const object = createRandomObject({ leafs: BENCHMAKR_TARGET_OBJECT_VALUES })

bench(`fold (complex object including ${BENCHMAKR_TARGET_OBJECT_VALUES} values)`, () => {
  fold(object)
})
