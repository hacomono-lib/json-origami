import { expect, it } from 'vitest'
import { toModifier } from '~/lib'

it('should retrieve keys from nested object', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(proxy.keys()).toEqual(['a.b.c'])
})

it('should retrieve keys with array indices using dot notation', () => {
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

  const proxy = toModifier(target, { arrayIndex: 'dot' })

  expect(proxy.keys()).toEqual(['a.b.c.0', 'a.b.c.1', 'a.b.c.2.f'])
})

it('should retrieve keys with array indices using bracket notation', () => {
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

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(proxy.keys()).toEqual(['a.b.c[0]', 'a.b.c[1]', 'a.b.c[2].f'])
})

it('should retrieve keys when target root is an array using bracket notation', () => {
  const target = [
    'a',
    'b',
    {
      c: 'd',
    },
  ]

  const proxy = toModifier(target, { arrayIndex: 'bracket' })

  expect(proxy.keys()).toEqual(['[0]', '[1]', '[2].c'])
})

it('should retrieve keys when target root is an array using dot notation', () => {
  const target = [
    'a',
    'b',
    {
      c: 'd',
    },
  ]

  const proxy = toModifier(target, { arrayIndex: 'dot' })

  expect(proxy.keys()).toEqual(['0', '1', '2.c'])
})

it('should not retrieve keys from empty object', () => {
  const target = {}

  const proxy = toModifier(target, { arrayIndex: 'dot' })
  expect(proxy.keys()).toEqual([])
})

it('should not retrieve keys from empty array', () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const target: any[] = []

  const proxy = toModifier(target, { arrayIndex: 'dot' })
  expect(proxy.keys()).toEqual([])
})

it('should retrieve keys when non-root elements are empty', () => {
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

  const proxy = toModifier(target, { arrayIndex: 'dot' })
  expect(proxy.keys()).toEqual(['a.b', 'c.d', 'e.f', 'g.h'])
})

it('should retrieve keys when non-root elements are empty in array', () => {
  const target = {
    a: [{}, [], undefined, null, '', 0],
  }

  const proxy = toModifier(target, { arrayIndex: 'bracket' })
  expect(proxy.keys()).toEqual(['a[0]', 'a[1]', 'a[2]', 'a[3]', 'a[4]', 'a[5]'])
})
