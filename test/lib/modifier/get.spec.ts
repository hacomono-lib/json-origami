import { expect, it } from 'vitest'
import { toModifier } from '~/lib'

it('should retrieve values using dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('a.b.c')).toBe('d')
  expect(modifier.get('a.b')).toEqual({ c: 'd' })
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

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('a.b')).toBe(modifier.get('a.b'))
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

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.get('a.b.c')).toEqual(['d', { e: 'f' }])
  expect(modifier.get('a.b.c.0')).toBe('d')
  expect(modifier.get('a.b.c.1')).toEqual({ e: 'f' })
  expect(modifier.get('a.b.c.1.e')).toBe('f')
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

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('a.b.c')).toEqual(['d', { e: 'f' }])
  expect(modifier.get('a.b.c[0]')).toBe('d')
  expect(modifier.get('a.b.c[1]')).toEqual({ e: 'f' })
  expect(modifier.get('a.b.c[1].e')).toBe('f')
})

it('should return undefined when accessing non-existent dot-notated key in object', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('e.f.g')).toBeUndefined()
  expect(modifier.get('x')).toBeUndefined()
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

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.get('a.b.c.2')).toBeUndefined()
  expect(modifier.get('a.b.c.1.f')).toBeUndefined()
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

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('a.b.c[2]')).toBeUndefined()
  expect(modifier.get('a.b.c[1].f')).toBeUndefined()
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

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.get('0.a')).toBe('b')
  expect(modifier.get('1.c')).toBe('d')
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

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.get('[0].a')).toBe('b')
  expect(modifier.get('[1].c')).toBe('d')
})

it('should retrieve empty object | array inside array', () => {
  const target = {
    a: {
      b: [{}],
      c: [[]],
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  expect(modifier.get('a.b[0]')).toEqual({})
  expect(modifier.get('a.c[0]')).toEqual([])
})

it('should prune undefined values in arrays and correctly retrieve values by index', () => {
  const target = {
    a: {
      b: {
        c: [undefined, 'd', undefined, 'e', undefined, 'f'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket', pruneNilInArray: true })
  expect(modifier.get('a.b.c')).toEqual([undefined, 'd', undefined, 'e', undefined, 'f'])
  expect(modifier.get('a.b.c[1]')).toBe('d')
})
