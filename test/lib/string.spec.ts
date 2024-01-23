import { expect, it } from 'vitest'
import { splitKey } from '~/lib/string'

it('should correctly split keys in bracket mode', () => {
  expect(splitKey('a[0].b.c', { arrayIndex: 'bracket' })).toEqual({ head: 'a', tail: '[0].b.c', nextHead: 0 })
})

it('should correctly split keys in dot mode', () => {
  expect(splitKey('a[0].b.c', { arrayIndex: 'dot' })).toEqual({ head: 'a[0]', tail: 'b.c', nextHead: 'b' })
})

it('should throw error for invalid keys in bracket mode', () => {
  expect(() => splitKey('a[abc].b.c', { arrayIndex: 'bracket' })).toThrowError('Invalid key: a[abc].b.c')
})

it('should correctly handle empty string keys in dot mode', () => {
  expect(splitKey('a..b.c.', { arrayIndex: 'dot' })).toEqual({ head: 'a', nextHead: '', tail: '.b.c.' })
  expect(splitKey('.b.c.', { arrayIndex: 'dot' })).toEqual({ head: '', nextHead: 'b', tail: 'b.c.' })
  expect(splitKey('c.', { arrayIndex: 'dot' })).toEqual({ head: 'c', nextHead: '', tail: '' })
})

it('should handle keys with multiple array indices in bracket mode', () => {
  const result = splitKey('[0][1].b.c', { arrayIndex: 'bracket' })
  expect(result).toEqual({ head: 0, tail: '[1].b.c', nextHead: 1 })
})

it('should handle keys with multiple array indices in dot mode', () => {
  const result = splitKey('[0][1].b.c', { arrayIndex: 'dot' })
  expect(result).toEqual({ head: '[0][1]', tail: 'b.c', nextHead: 'b' })
})

it('should handle keys with single key in dot mode', () => {
  expect(splitKey('a', { arrayIndex: 'dot' })).toEqual({ head: 'a' })
})
