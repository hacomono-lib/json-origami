import { describe, it, expect } from 'vitest'
import { fold } from '../../src/fold'
import { createRandomObject } from './factory'

describe('createRandomObject', () => {
  // ランダム生成なので、同じテストケースを複数回実施し、結果が安定していることを確認する
  it.each([0, 30, 100, 500, 1_000, 5_000, 10_000])(`should created object has the same number of LEAFs as the specified number(%s)`, (leafs) => {
    const target = createRandomObject({ leafs })
    const result = fold(target)
    expect(Object.keys(result).length).toBe(leafs)
  })
})
