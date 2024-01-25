import { expect, it } from 'vitest'
import { createEmptyModifier, toModifier } from '~/lib'

it('should not set any value when modifier created by "toModifier"', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })
  modifier.set('a.b.c', 'e')

  expect(modifier.finalize()).toEqual({
    a: {
      b: {
        c: 'd',
      },
    },
  })
})

it('should initialize as object whe nroot key is string', () => {
  const modifier = createEmptyModifier({ arrayIndex: 'dot' })

  modifier.set('a.b.c', 'd')

  expect(modifier.finalize()).toEqual({ a: { b: { c: 'd' } } })
})

it('should initialize as array when root key is numeric', () => {
  const modifier = createEmptyModifier({ arrayIndex: 'dot' })

  modifier.set('0.1.2', 3)

  expect(modifier.finalize()).toEqual([[undefined, [undefined, undefined, 3]]])
})

it('should prune empty in array', () => {
  const modifier = createEmptyModifier({ arrayIndex: 'dot', pruneNilInArray: true })

  modifier.set('0.1.2', 3)

  expect(modifier.finalize()).toEqual([[[3]]])
})
