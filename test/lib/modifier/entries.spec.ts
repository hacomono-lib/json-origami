import { expect, it } from 'vitest'
import { toModifier } from '~/lib'

it('should retrieve entries from nested object', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.entries()).toEqual([['a.b.c', 'd']])
})

it('should retrieve entries with array indices using dot notation', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          'e',
          {
            f: 'g',
          },
        ],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.entries()).toEqual([
    ['a.b.c.0', 'd'],
    ['a.b.c.1', 'e'],
    ['a.b.c.2.f', 'g'],
  ])
})

it('should retrieve entries with array indices using bracket notation', () => {
  const target = {
    a: {
      b: {
        c: [
          'd',
          'e',
          {
            f: 'g',
          },
        ],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.entries()).toEqual([
    ['a.b.c[0]', 'd'],
    ['a.b.c[1]', 'e'],
    ['a.b.c[2].f', 'g'],
  ])
})

it('should retrieve entries when target root is an array using bracket notation', () => {
  const target = [
    'a',
    'b',
    {
      c: 'd',
    },
  ]

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.entries()).toEqual([
    ['[0]', 'a'],
    ['[1]', 'b'],
    ['[2].c', 'd'],
  ])
})

it('should retrieve entries when target root is an array using dot notation', () => {
  const target = [
    'a',
    'b',
    {
      c: 'd',
    },
  ]

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.entries()).toEqual([
    ['0', 'a'],
    ['1', 'b'],
    ['2.c', 'd'],
  ])
})

it('should not retrieve entries from empty object', () => {
  const target = {}

  const modifier = toModifier(target, { arrayIndex: 'dot' })
  expect(modifier.entries()).toEqual([])
})

it('should not retrieve entries from empty array', () => {
  const target: unknown[] = []

  const modifier = toModifier(target, { arrayIndex: 'dot' })
  expect(modifier.entries()).toEqual([])
})

it('should retrieve entries when non-root elements are empty', () => {
  const target = {
    a: {
      b: {},
    },
    c: {
      d: [],
    },
    e: {
      f: undefined,
    },
    g: {
      h: null,
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.entries()).toEqual([
    ['a.b', {}],
    ['c.d', []],
    ['e.f', undefined],
    ['g.h', null],
  ])
})

it('should retrieve entries when non-root elements are empty in array', () => {
  const target = {
    a: [{}, [], undefined, null, '', 0],
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.entries()).toEqual([
    ['a[0]', {}],
    ['a[1]', []],
    ['a[2]', undefined],
    ['a[3]', null],
    ['a[4]', ''],
    ['a[5]', 0],
  ])
})
