/* eslint-disable max-lines */
import { it, expect } from 'vitest'
import { unfold } from '../src/unfold'

it('should handle nested object', () => {
  const kv = {
    a: 1,
    'b.c': 2,
    'b.d[0]': 3,
    'b.d[1]': 4
  }

  expect(unfold(kv)).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, 4]
    }
  })
})

it('should handle nested object with dot array indices', () => {
  const kv = {
    a: 1,
    'b.c': 2,
    'b.d.0': 3,
    'b.d.1': 4
  }

  expect(unfold(kv, { arrayIndex: 'dot' })).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, 4]
    }
  })
})

it('should handle nested object with root array', () => {
  const kv = {
    '[0].a': 1,
    '[0].b.c': 2,
    '[0].b.d[0]': 3,
    '[0].b.d[1]': 4,
    '[1].e': 5,
    '[1].f.g': 6,
    '[1].f.h[0]': 7,
    '[1].f.h[1]': 8
  }

  expect(unfold(kv)).toEqual([
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
  ])
})

it('should handle nested object with root array with dot array indices', () => {
  const kv = {
    '0.a': 1,
    '0.b.c': 2,
    '0.b.d.0': 3,
    '0.b.d.1': 4,
    '1.e': 5,
    '1.f.g': 6,
    '1.f.h.0': 7,
    '1.f.h.1': 8
  }

  expect(unfold(kv, { arrayIndex: 'dot' })).toEqual([
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
  ])
})

it('should handle non-continuous array indices', () => {
  const kv = {
    'a[1]': 1,
    'a[3]': 2,
    'a[5]': 3,
    'b[1].c': 4,
    'b[1].d': 5,
    'b[3].e': 6,
    'b[3].f': 7,
    'b[5].g': 8,
    'b[5].h': 9
  }

  expect(unfold(kv, { pruneArray: true })).toEqual({
    a: [1, 2, 3],
    b: [
      {
        c: 4,
        d: 5
      },
      {
        e: 6,
        f: 7
      },
      {
        g: 8,
        h: 9
      }
    ]
  })
})

it('should handle non-continuous array indices with undefined values', () => {
  const kv = {
    'a[1]': 1,
    'a[3]': 2,
    'a[5]': 3,
    'b[1].c': 4,
    'b[1].d': 5,
    'b[3].e': 6,
    'b[3].f': 7,
    'b[5].g': 8,
    'b[5].h': 9
  }

  expect(unfold(kv, { pruneArray: false })).toEqual({
    a: [undefined, 1, undefined, 2, undefined, 3],
    b: [
      undefined,
      {
        c: 4,
        d: 5
      },
      undefined,
      {
        e: 6,
        f: 7
      },
      undefined,
      {
        g: 8,
        h: 9
      }
    ]
  })
})

it('should handle include special characters', () => {
  const kv = {
    'theme.$color_primary': '#25adc9',
    'theme.$color_secondary': '#333333',
    'theme.$color_black': '#191919',
    'feature.@mention': 'true'
  }

  expect(unfold(kv)).toEqual({
    feature: {
      '@mention': 'true'
    },
    theme: {
      $color_primary: '#25adc9',
      $color_secondary: '#333333',
      $color_black: '#191919'
    }
  })
})

it('should handle include empty object or empty array', () => {
  const kv = {
    'a.b': {},
    'a.c': [],
  }

  expect(unfold(kv)).toEqual({
    a: {
      b: {},
      c: []
    }
  })
})
