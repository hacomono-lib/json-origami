import { expect, it } from 'vitest'
import { toProxy, toRaw } from '~/lib'

it('should delete value by dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b.c']

  expect(toRaw(proxy.value)).toEqual({ a: { b: {} } })
})

it('should delete value by dot-notated parent key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b']
  expect(toRaw(proxy.value)).toEqual({ a: {} })
})

it('should delete value by dot-notated key in array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'dot' })
  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b.c.0']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should delete value by dot-notated key in array with bracket', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b.c[0]']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should completely delete empty value when pruneEmpty is true', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket', pruneEmpty: true })
  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b.c[0]']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })

  // biome-ignore lint/performance/noDelete: <explanation>
  delete proxy.value['a.b.c[1]']
  expect(toRaw(proxy.value)).toEqual({})
})
