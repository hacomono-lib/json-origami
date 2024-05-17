import { expect, it } from 'vitest'
import { has } from '~/has'

it('should decide existence values using dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  expect(has(target, 'a.b.c')).toBeTruthy()
  expect(has(target, 'a.b')).toBeTruthy()
})

it('should decide not-existence values using non-existing dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  expect(has(target, 'a.b.c.d')).toBeFalsy()
  expect(has(target, 'a.b.d')).toBeFalsy()
})

it('should decide existence values using dot-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  expect(has(target, 'a.b.c.0', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, 'a.b.c.1', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, 'a.b.c.0.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.1.d', { arrayIndex: 'dot' })).toBeFalsy()
})

it('should decide not-existence values using non-existing dot-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  expect(has(target, 'a.b.c.2', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.3', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.2.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.3.d', { arrayIndex: 'dot' })).toBeFalsy()
})

it('should decide existence values using bracket-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  expect(has(target, 'a.b.c[0]')).toBeTruthy()
  expect(has(target, 'a.b.c[1]')).toBeTruthy()
  expect(has(target, 'a.b.c[0].d')).toBeFalsy()
  expect(has(target, 'a.b.c[1].d')).toBeFalsy()
})

it('should decide not-existence values using non-existing bracket-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  expect(has(target, 'a.b.c[2]')).toBeFalsy()
  expect(has(target, 'a.b.c[3]')).toBeFalsy()
  expect(has(target, 'a.b.c[2].d')).toBeFalsy()
  expect(has(target, 'a.b.c[3].d')).toBeFalsy()
})

it('should decide existence values using dot-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  expect(has(target, 'a.b.c.0', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, 'a.b.c.1', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, 'a.b.c.0.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.1.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.1.e', { arrayIndex: 'dot' })).toBeTruthy()
})

it('should decide not-existence values using non-existing dot-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  expect(has(target, 'a.b.c.2', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.3', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.2.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.3.d', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.2.e', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, 'a.b.c.3.e', { arrayIndex: 'dot' })).toBeFalsy()
})

it('should decide existence values using bracket-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  expect(has(target, 'a.b.c[0]')).toBeTruthy()
  expect(has(target, 'a.b.c[1]')).toBeTruthy()
  expect(has(target, 'a.b.c[0].d')).toBeFalsy()
  expect(has(target, 'a.b.c[1].d')).toBeFalsy()
  expect(has(target, 'a.b.c[1].e')).toBeTruthy()
})

it('should decide not-existence values using non-existing bracket-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  expect(has(target, 'a.b.c[2]')).toBeFalsy()
  expect(has(target, 'a.b.c[3]')).toBeFalsy()
  expect(has(target, 'a.b.c[2].d')).toBeFalsy()
  expect(has(target, 'a.b.c[3].d')).toBeFalsy()
  expect(has(target, 'a.b.c[2].e')).toBeFalsy()
  expect(has(target, 'a.b.c[3].e')).toBeFalsy()
})

it('should decide existence values from root array using dot-notation', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  expect(has(target, '0', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, '1', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, '0.a', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, '1.c', { arrayIndex: 'dot' })).toBeTruthy()
  expect(has(target, '0.b', { arrayIndex: 'dot' })).toBeFalsy()
})

it('should decide not-existence values from root array using dot-notation', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  expect(has(target, '2', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, '3', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, '2.a', { arrayIndex: 'dot' })).toBeFalsy()
  expect(has(target, '3.c', { arrayIndex: 'dot' })).toBeFalsy()
})

it('should decide non-existence values in empty object | array inside array', () => {
  const target = {
    a: {
      b: [{}],
      c: [[]],
    },
  }

  expect(has(target, 'a.b[0]')).toBeTruthy()
  expect(has(target, 'a.b[0].d')).toBeFalsy()
  expect(has(target, 'a.c[0]')).toBeTruthy()
  expect(has(target, 'a.c[0][0]')).toBeFalsy()
})

it('should decide existence key of "undefined" values with default option', () => {
  const target = {
    a: {
      b: undefined,
    },
  }

  expect(has(target, 'a.b')).toBeTruthy()
  expect(has(target, 'a.c')).toBeFalsy()
})

it('should decide existence key of "undefined" values with "treatUndefinedAsNonexistent" option', () => {
  const target = {
    a: {
      b: undefined,
    },
  }

  expect(has(target, 'a.b', { treatUndefinedAsNonexistent: false })).toBeFalsy()
  expect(has(target, 'a.c', { treatUndefinedAsNonexistent: false })).toBeFalsy()
})

it('should return true for empty-string key', () => {
  expect(has({ a: 'b' }, '')).toBeTruthy()
})
