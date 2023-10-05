/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { omit } from '../src/omit'

describe('omit', () => {
  it('should omit specified keys from the object', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
        e: {
          f: 5,
          g: 6
        }
      }
    }
    const result = omit(obj, ['a', 'b.c', 'b.e.f'])
    expect(result).toEqual({
      b: {
        d: [3, 4],
        e: {
          g: 6
        }
      }
    })
  })

  it('should handle arrays correctly (bracket mode)', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
        e: {
          f: 5,
          g: 6
        }
      }
    }
    const result = omit(obj, ['b.d[1]'])
    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3],
        e: {
          f: 5,
          g: 6
        }
      }
    })
  })

  it('should handle arrays correctly (dot mode)', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
        e: {
          f: 5,
          g: 6
        }
      }
    }
    const result = omit(obj, ['b.d.1'])
    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3],
        e: {
          f: 5,
          g: 6
        }
      }
    })
  })

  it('should handle keys that are prefixes of other keys', () => {
    const obj = {
      a: 1,
      ab: 2,
      abc: 3
    }
    const result = omit(obj, ['a', 'ab'])
    expect(result).toEqual({
      abc: 3
    })
  })

  it('should handle keys that are prefixes of nested other keys', () => {
    const obj = {
      a: {
        b: 1
      },
      ab: {
        b: 2
      },
      abc: {
        b: 3
      }
    }
    const result = omit(obj, ['a.b', 'ab'])
    expect(result).toEqual({
      abc: { b: 3 }
    })
  })

  it('should handle keys that are suffixes of other keys', () => {
    const obj = {
      a: 1,
      ba: 2,
      cba: 3
    }
    const result = omit(obj, ['a', 'ba'])
    expect(result).toEqual({
      cba: 3
    })
  })
})