import { expect, it } from 'vitest'
import { twist } from '~/twist'

it('twist partial keys', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { a: 'w', b: 'x', c: 'y', d: 'z' })).toEqual({
    w: 1,
    x: {
      c: 2,
      d: [3, 4],
    },
  })
})

it('twist nested keys', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { 'b.c': 'x', 'b.d': 'y' })).toEqual({
    a: 1,
    b: {},
    x: 2,
    y: [3, 4],
  })
})

it('merge existed key', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { a: 'b.a' })).toEqual({
    b: {
      a: 1,
      c: 2,
      d: [3, 4],
    },
  })
})

it('swap object keys', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { a: 'b', b: 'a' })).toEqual({
    a: {
      c: 2,
      d: [3, 4],
    },
    b: 1,
  })
})

it('swap array index', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { 'b.d[0]': 'b.d[1]', 'b.d[1]': 'b.d[0]' })).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [4, 3],
    },
  })
})

it('swap array index with dot array index', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, { 'b.d.0': 'b.d.1', 'b.d.1': 'b.d.0' }, { arrayIndex: 'dot' })).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [4, 3],
    },
  })
})

it('should handle object with numeric and string keys in root', () => {
  const target = [
    {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    },
    {
      e: 5,
      f: {
        g: 6,
        h: [7, 8],
      },
    },
  ] as const

  expect(
    twist(target, { '[0].a': 'w', '[0].b.c': 'x', '[1].f.h[0]': 'y', '[1].f.h[1]': 'z' }, { pruneArray: true }),
  ).toEqual({
    '0': {
      b: {
        d: [3, 4],
      },
    },
    '1': {
      e: 5,
      f: {
        g: 6,
        h: [],
      },
    },
    w: 1,
    x: 2,
    y: 7,
    z: 8,
  })
})

it('should handle object with numeric and string keys in root with dot array index', () => {
  const target = [
    {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
      },
    },
    {
      e: 5,
      f: {
        g: 6,
        h: [7, 8],
      },
    },
  ] as const

  expect(
    twist(
      target,
      { '0.a': 'w', '0.b.c': 'x', '1.f.h.0': 'y', '1.f.h.1': 'z' },
      { arrayIndex: 'dot', pruneArray: true },
    ),
  ).toEqual({
    '0': {
      b: {
        d: [3, 4],
      },
    },
    '1': {
      e: 5,
      f: {
        g: 6,
        h: [],
      },
    },
    w: 1,
    x: 2,
    y: 7,
    z: 8,
  })
})

it('should prune array elements', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4, 5, 6],
    },
  }

  expect(twist(target, { 'b.d[1]': 'x' }, { pruneArray: true })).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, 5, 6],
    },
    x: 4,
  })
})

it('should not prune array elements', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4, 5, 6],
    },
  }

  expect(twist(target, { 'b.d[1]': 'x' }, { pruneArray: false })).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, undefined, 5, 6],
    },
    x: 4,
  })
})

it('should return the original object when the second argument is an empty object', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  }

  expect(twist(target, {})).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
    },
  })
})

// map データのキーが前方一致する組み合わせがある場合. e.g. foo.bar, foo.bar1
it('should be twisted correctly when the prefix is the same string.', () => {
  const target = {
    foo: {
      bar: 0,
      bar1: 1,
      bar2: 2,
      barbar: 3,
    },
    foo1: {
      bar: 4,
      bar1: 5,
      bar2: 6,
    },
  }

  const map = {
    'foo.bar': 'baz',
    'foo.bar1': 'qux',
    'foo.bar2': 'quux',
    'foo.barbar': 'quux1',
  }

  expect(twist(target, map)).toEqual({
    foo: {},
    foo1: {
      bar: 4,
      bar1: 5,
      bar2: 6,
    },
    baz: 0,
    qux: 1,
    quux: 2,
    quux1: 3,
  })
})
