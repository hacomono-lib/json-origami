/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { it, expect } from 'vitest'
import { toProxy, toRaw } from '../../../src/lib/origami-proxy'

it('should delete value by dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd'
      }
    }
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  delete proxy.value['a.b.c']

  expect(toRaw(proxy.value)).toEqual({ a: { b: {} } })
})

it('should delete value by dot-notated parent key', () => {
  const target = {
    a: {
      b: {
        c: 'd'
      }
    }
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  delete proxy.value['a.b']
  expect(toRaw(proxy.value)).toEqual({ a: {} })
})

it('should delete value by dot-notated key in array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e']
      }
    }
  }

  const proxy = toProxy(target, { arrayIndex: 'dot' })
  delete proxy.value['a.b.c.0']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should delete value by dot-notated key in array with bracket', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e']
      }
    }
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  delete proxy.value['a.b.c[0]']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })
})

it('should completely delete empty value when pruneEmpty is true', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e']
      }
    }
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket', pruneEmpty: true })
  delete proxy.value['a.b.c[0]']

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: [undefined, 'e'] } } })

  delete proxy.value['a.b.c[1]']
  expect(toRaw(proxy.value)).toEqual({})
})
