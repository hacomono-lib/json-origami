/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { unfold } from '../src'

describe('unfold', () => {
  it('nested object', () => {
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

  it('nested object with dot array index', () => {
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

  it('nested object with root array', () => {
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

  it('nested object with root array with dot array index', () => {
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

  it('include special characters', () => {
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
})
