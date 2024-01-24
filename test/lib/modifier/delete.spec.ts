import { expect, it } from 'vitest'
import { toModifier } from '~/lib'

it('should delete value by key written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  modifier.delete('a.b.c')

  expect(modifier.finalize()).toEqual({ a: { b: {} } })
})

it('should delete value by parent key written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  modifier.delete('a.b')
  expect(modifier.finalize()).toEqual({ a: {} })
})

it('should delete value by key in array written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })
  modifier.delete('a.b.c.0')

  expect(modifier.finalize()).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should delete value by key in array written in bracket notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  modifier.delete('a.b.c[0]')

  expect(modifier.finalize()).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should completely delete empty value when pruneNil option is true', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket', pruneNil: true })
  modifier.delete('a.b.c[0]')
  modifier.delete('a.b.c[1]')

  expect(modifier.finalize()).toEqual({ a: { b: { c: [] } } })
})
