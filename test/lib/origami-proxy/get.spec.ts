import { expect, it } from 'vitest'
import { toModifier, toRaw } from '~/lib'

it('should retrieve values using dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.get('a.b.c'))).toBe('d')
  expect(toRaw(proxy.get('a.b'))).toEqual({ c: 'd' })
})

it('should return same object reference when retrieving values using same dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: {
          d: {
            e: 'f',
          },
        },
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.get('a.b'))).toBe(toRaw(proxy.get('a.b')))
})

it('should retrieve values including array using dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          {
            e: 'f',
          },
        ],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'dot' })

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['d', { e: 'f' }])
  expect(toRaw(proxy.get('a.b.c.0'))).toBe('d')
  expect(toRaw(proxy.get('a.b.c.1'))).toEqual({ e: 'f' })
  expect(toRaw(proxy.get('a.b.c.1.e'))).toBe('f')
})

it('should retrieve values including array using dot-notated key with bracket notation', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          {
            e: 'f',
          },
        ],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['d', { e: 'f' }])
  expect(toRaw(proxy.get('a.b.c[0]'))).toBe('d')
  expect(toRaw(proxy.get('a.b.c[1]'))).toEqual({ e: 'f' })
  expect(toRaw(proxy.get('a.b.c[1].e'))).toBe('f')
})

it('should return undefined when accessing non-existent dot-notated key in object', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(proxy.get('e.f.g')).toBeUndefined()
  expect(proxy.get('x')).toBeUndefined()
})

it('should return undefined when accessing non-existent dot-notation key in object including array', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          {
            e: 'f',
          },
        ],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'dot' })

  expect(proxy.get('a.b.c.2')).toBeUndefined()
  expect(proxy.get('a.b.c.1.f')).toBeUndefined()
})

it('should return undefined when accessing non-existent dot-notation key in object including array with bracket notation', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          {
            e: 'f',
          },
        ],
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(proxy.get('a.b.c[2]')).toBeUndefined()
  expect(proxy.get('a.b.c[1].f')).toBeUndefined()
})

it('should retrieve values from root array using dot notation', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  const proxy = toModifier(target, { arrayIndex: 'dot' })

  expect(toRaw(proxy.get('0.a'))).toBe('b')
  expect(toRaw(proxy.get('1.c'))).toBe('d')
})

it('should retrieve values from root array using bracket notation within dot notation', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.get('[0]a'))).toBe('b')
  expect(toRaw(proxy.get('[1]c'))).toBe('d')
})

it('should retrieve empty object | array inside array', () => {
  const target = {
    a: {
      b: [{}],
      c: [[]],
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })
  expect(toRaw(proxy.get('a.b[0]'))).toEqual({})
  expect(toRaw(proxy.get('a.c[0]'))).toEqual([])
})
