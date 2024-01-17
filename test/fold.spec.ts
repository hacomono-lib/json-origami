/* eslint-disable max-lines */
import { it, expect } from 'vitest'
import { fold } from '../src/fold'

it('should handle empty', () => {
  const target = {}
  expect(fold(target)).toEqual({})
})

it('should handle nested object', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4]
    }
  }
  expect(fold(target)).toEqual({
    a: 1,
    'b.c': 2,
    'b.d[0]': 3,
    'b.d[1]': 4
  })
})

it('should handle nested object with dot array index', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4]
    }
  }
  expect(fold(target, { arrayIndex: 'dot' })).toEqual({
    a: 1,
    'b.c': 2,
    'b.d.0': 3,
    'b.d.1': 4
  })
})

it('should handle nested object with root array', () => {
  const target = [
    {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    },
    {
      e: 5,
      f: {
        g: 6,
        h: [7, 8]
      }
    }
  ] as const

  expect(fold(target)).toEqual({
    '[0].a': 1,
    '[0].b.c': 2,
    '[0].b.d[0]': 3,
    '[0].b.d[1]': 4,
    '[1].e': 5,
    '[1].f.g': 6,
    '[1].f.h[0]': 7,
    '[1].f.h[1]': 8
  })
})

it('should handle nested object with root array with dot array index', () => {
  const target = [
    {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    },
    {
      e: 5,
      f: {
        g: 6,
        h: [7, 8]
      }
    }
  ] as const

  expect(fold(target, { arrayIndex: 'dot' })).toEqual({
    '0.a': 1,
    '0.b.c': 2,
    '0.b.d.0': 3,
    '0.b.d.1': 4,
    '1.e': 5,
    '1.f.g': 6,
    '1.f.h.0': 7,
    '1.f.h.1': 8
  })
})

it('should handle nested object with key prefix', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4]
    }
  }

  expect(fold(target, { keyPrefix: 'root' })).toEqual({
    'root.a': 1,
    'root.b.c': 2,
    'root.b.d[0]': 3,
    'root.b.d[1]': 4
  })
})

it('should handle nested object with root array with key prefix', () => {
  const target = [
    {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    },
    {
      e: 5,
      f: {
        g: 6,
        h: [7, 8]
      }
    }
  ] as const

  expect(fold(target, { keyPrefix: 'root' })).toEqual({
    'root[0].a': 1,
    'root[0].b.c': 2,
    'root[0].b.d[0]': 3,
    'root[0].b.d[1]': 4,
    'root[1].e': 5,
    'root[1].f.g': 6,
    'root[1].f.h[0]': 7,
    'root[1].f.h[1]': 8
  })
})

it('should handle nested object with empty object / empty array', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
      e: {},
      f: { g: {} },
      h: [],
      i: [ [] ],
      j: [ {} ],
      k: [ {}, {} ]
    }
  }

  expect(fold(target)).toEqual({
    a: 1,
    'b.c': 2,
    'b.d[0]': 3,
    'b.d[1]': 4,
    'b.e': {},
    'b.f.g': {},
    'b.h': [],
    'b.i[0]': [],
    'b.j[0]': {},
    'b.k[0]': {},
    'b.k[1]': {}
  })
})

