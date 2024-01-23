import { expect, it } from 'vitest'
import { toModifier, toRaw } from '~/lib'

it('should delete value by key written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })
  proxy.delete('a.b.c')

  expect(toRaw(proxy)).toEqual({ a: { b: {} } })
})

it('should delete value by parent key written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })
  proxy.delete('a.b')
  expect(toRaw(proxy)).toEqual({ a: {} })
})

it('should delete value by key in array written in dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'dot' })
  proxy.delete('a.b.c.0')

  expect(toRaw(proxy)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should delete value by key in array written in bracket notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })
  proxy.delete('a.b.c[0]')

  expect(toRaw(proxy)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should completely delete empty value when pruneEmpty option is true', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket', pruneEmpty: true })
  proxy.delete('a.b.c[0]')

  expect(toRaw(proxy)).toEqual({ a: { b: { c: [undefined, 'e'] } } })

  proxy.delete('a.b.c[1]')
  expect(toRaw(proxy)).toEqual({})
})
