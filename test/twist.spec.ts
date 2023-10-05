/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { twist } from '../src/twist'

describe('twist', () => {
  it('twist partial keys', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'A', b: 'B', c: 'C', d: 'D' })).toEqual({
      A: 1,
      B: {
        c: 2,
        d: [3, 4]
      }
    })
  })

  it('twist nested keys', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { 'b.c': 'C', 'b.d': 'D' })).toEqual({
      a: 1,
      C: 2,
      D: [3, 4]
    })
  })

  it('merge existed key', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'b.a' })).toEqual({
      b: {
        a: 1,
        c: 2,
        d: [3, 4]
      }
    })
  })

  it('swap object keys', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'b', b: 'a' })).toEqual({
      a: {
        c: 2,
        d: [3, 4]
      },
      b: 1
    })
  })

  it('swap array index', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { 'b.d[0]': 'b.d[1]', 'b.d[1]': 'b.d[0]' })).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [4, 3]
      }
    })
  })

  it('swap array index with dot array index', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { 'b.d.0': 'b.d.1', 'b.d.1': 'b.d.0' }, { arrayIndex: 'dot' })).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [4, 3]
      }
    })
  })

  it('should handle object with numeric and string keys in root', () => {
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

    expect(
      twist(target, { '[0].a': 'A', '[0].b.c': 'C', '[1].f.h[0]': 'D', '[1].f.h[1]': 'E' })
    ).toEqual({
      '0': {
        b: {
          d: [3, 4]
        }
      },
      '1': {
        e: 5,
        f: {
          g: 6
        }
      },
      A: 1,
      C: 2,
      D: 7,
      E: 8
    })
  })

  it('should handle object with numeric and string keys in root with dot array index', () => {
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

    expect(
      twist(
        target,
        { '0.a': 'A', '0.b.c': 'C', '1.f.h.0': 'D', '1.f.h.1': 'E' },
        { arrayIndex: 'dot' }
      )
    ).toEqual({
      '0': {
        b: {
          d: [3, 4]
        }
      },
      '1': {
        e: 5,
        f: {
          g: 6
        }
      },
      A: 1,
      C: 2,
      D: 7,
      E: 8
    })
  })

  it('should prune array elements', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4, 5, 6]
      }
    }

    expect(twist(target, { 'b.d[1]': 'D' }, { pruneArray: true })).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3, 5, 6]
      },
      D: 4
    })
  })

  it('should not prune array elements', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4, 5, 6]
      }
    }

    expect(twist(target, { 'b.d[1]': 'D' }, { pruneArray: false })).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3, undefined, 5, 6]
      },
      D: 4
    })
  })

  it('should return the original object when the second argument is an empty object', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, {})).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    })
  })
})
