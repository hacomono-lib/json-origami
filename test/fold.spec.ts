/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { fold } from '../src'

describe('fold', () => {
  it('nested object', () => {
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

  it('nested object with dot array index', () => {
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

  it('nested object with root array', () => {
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

  it('nested object with root array with dot array index', () => {
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
})
