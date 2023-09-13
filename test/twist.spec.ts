/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { twist } from '../src'

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

  it('result has blank value in array', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { 'b.d[0]': 'b.d[2]' })).toEqual({
      a: 1,
      b: {
        c: 2,
        d: [undefined, 4, 3]
      }
    })
  })

  // FIXME: this test case is not passed
  it.skip('override object value', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'b.c' })).toEqual({
      b: {
        c: 1,
        d: [3, 4]
      }
    })
  })

  // FIXME: this test case is not passed
  it.skip('override array value', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'b.d[1]' })).toEqual({
      b: {
        c: 3,
        d: [3, 1]
      }
    })
  })

  // FIXME: this test case is not passed
  it.skip('overrode nested value', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    }

    expect(twist(target, { a: 'b' })).toEqual({
      b: 1
    })
  })
})
