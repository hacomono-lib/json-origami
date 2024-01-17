/* eslint-disable max-lines-per-function */
import type { JsonArray, JsonObject, JsonValue, Writable } from 'type-fest'
import { createRandomWord, dice, randomChoice } from './random'

const DEFAULT_LEAFS = 1000

interface RandomObjectOption {
  leafs?: number
}

export function createRandomObject({ leafs }: RandomObjectOption = {}): JsonObject {
  let leafCount = 0

  if (leafs % 1 !== 0) throw new Error('leafs must be an integer')

  const maxLeafs = leafs ?? DEFAULT_LEAFS

  function createNumberLeaf(): number {
    leafCount++
    return leafCount
  }

  function createStringLeaf(): string {
    leafCount++
    return String(leafCount)
  }

  function createBooleanLeaf(): boolean {
    leafCount++
    return leafCount % 2 === 0
  }

  function createObject({ root }: { root?: boolean } = {}): JsonObject {
    const obj: JsonObject = {}

    while ((root || dice(0.6)) && leafCount < maxLeafs) {
      const key = createRandomWord()

      if (!key || key in obj) continue

      const value = createValue()
      obj[key] = value
    }

    if (Object.keys(obj).length <= 0) {
      leafCount++
    }

    return obj
  }

  function createArray(): JsonArray {
    const arr: Writable<JsonArray> = []

    while (dice(0.3) && leafCount < maxLeafs) {
      const value = createValue()
      arr.push(value)
    }

    if (arr.length <= 0) {
      leafCount++
    }

    return arr
  }

  function createValue(): JsonValue {
    const choice = randomChoice(['number', 'string', 'boolean', 'object', 'array'])

    switch (choice) {
      case 'number':
        return createNumberLeaf()
      case 'string':
        return createStringLeaf()
      case 'boolean':
        return createBooleanLeaf()
      case 'object':
        return createObject()
      case 'array':
        return createArray()
    }
  }

  return createObject({ root: true })
}

export function randomKeyName(): string {
  const length = Math.floor(Math.random() * 10) + 1
  const words = Array.from({ length }, createRandomWord)
  return words.join('.')
}