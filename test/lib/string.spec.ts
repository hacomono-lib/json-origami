import { describe, expect, it } from 'vitest'
import { splitHead, splitTails } from '~/lib/string'

describe('splitHead', () => {
  it('should correctly split keys in bracket mode', () => {
    expect(splitHead('a[0].b.c', { arrayIndex: 'bracket' })).toEqual({ head: 'a', rest: '[0].b.c', nextHead: 0 })
  })

  it('should correctly split keys in dot mode', () => {
    expect(splitHead('a[0].b.c', { arrayIndex: 'dot' })).toEqual({ head: 'a[0]', rest: 'b.c', nextHead: 'b' })
  })

  it('should throw error for invalid keys in bracket mode', () => {
    expect(() => splitHead('a[abc].b.c', { arrayIndex: 'bracket' })).toThrowError('Invalid key: a[abc].b.c')
  })

  it('should correctly handle empty string keys in dot mode', () => {
    expect(splitHead('a..b.c.', { arrayIndex: 'dot' })).toEqual({ head: 'a', nextHead: '', rest: '.b.c.' })
    expect(splitHead('.b.c.', { arrayIndex: 'dot' })).toEqual({ head: '', nextHead: 'b', rest: 'b.c.' })
    expect(splitHead('c.', { arrayIndex: 'dot' })).toEqual({ head: 'c' })
  })

  it('should handle keys with multiple array indices in bracket mode', () => {
    const result = splitHead('[0][1].b.c', { arrayIndex: 'bracket' })
    expect(result).toEqual({ head: 0, rest: '[1].b.c', nextHead: 1 })
  })

  it('should handle keys with multiple array indices in dot mode', () => {
    const result = splitHead('[0][1].b.c', { arrayIndex: 'dot' })
    expect(result).toEqual({ head: '[0][1]', rest: 'b.c', nextHead: 'b' })
  })

  it('should handle keys with single key in dot mode', () => {
    expect(splitHead('a', { arrayIndex: 'dot' })).toEqual({ head: 'a' })
  })
})

describe('splitTails', () => {
  it('should correctly split keys in bracket mode', () => {
    expect(splitTails('a[0].b.c', { arrayIndex: 'bracket' })).toEqual([
      { tail: 'c', remainder: 'a[0].b' },
      { tail: 'b.c', remainder: 'a[0]' },
      { tail: '[0].b.c', remainder: 'a' },
    ])
  })

  it('should correctly split keys in dot mode', () => {
    expect(splitTails('a.0.b.c', { arrayIndex: 'dot' })).toEqual([
      { tail: 'c', remainder: 'a.0.b' },
      { tail: 'b.c', remainder: 'a.0' },
      { tail: '0.b.c', remainder: 'a' },
    ])
  })

  it('should correctly handle empty string keys in dot mode', () => {
    expect(splitTails('a..b.c.', { arrayIndex: 'dot' })).toEqual([
      { tail: '', remainder: 'a..b.c' },
      { tail: 'c.', remainder: 'a..b' },
      { tail: 'b.c.', remainder: 'a.' },
      { tail: '.b.c.', remainder: 'a' },
    ])
    expect(splitTails('.b.c.', { arrayIndex: 'dot' })).toEqual([
      { tail: '', remainder: '.b.c' },
      { tail: 'c.', remainder: '.b' },
      { tail: 'b.c.', remainder: '' },
    ])
    expect(splitTails('c.', { arrayIndex: 'dot' })).toEqual([{ tail: '', remainder: 'c' }])
  })

  it('should handle keys with multiple array indices in bracket mode', () => {
    const result = splitTails('[0][1].b.c', { arrayIndex: 'bracket' })
    expect(result).toEqual([
      { tail: 'c', remainder: '[0][1].b' },
      { tail: 'b.c', remainder: '[0][1]' },
      { tail: '[1].b.c', remainder: '[0]' },
    ])
  })

  it('should handle keys with multiple array indices in dot mode', () => {
    const result = splitTails('0.1.b.c', { arrayIndex: 'dot' })
    expect(result).toEqual([
      { tail: 'c', remainder: '0.1.b' },
      { tail: 'b.c', remainder: '0.1' },
      { tail: '1.b.c', remainder: '0' },
    ])
  })
})
