import { expect, it } from 'vitest'
import { toModifier } from '~/lib'

it('should decide existence values using dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c')).toBeTruthy()
  expect(modifier.has('a.b')).toBeTruthy()
})

it('should decide not-existence values using non-existing dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c.d')).toBeFalsy()
  expect(modifier.has('a.b.d')).toBeFalsy()
})

it('should decide existence values using dot-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('a.b.c.0')).toBeTruthy()
  expect(modifier.has('a.b.c.1')).toBeTruthy()
  expect(modifier.has('a.b.c.0.d')).toBeFalsy()
  expect(modifier.has('a.b.c.1.d')).toBeFalsy()
})

it('should decide not-existence values using non-existing dot-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('a.b.c.2')).toBeFalsy()
  expect(modifier.has('a.b.c.3')).toBeFalsy()
  expect(modifier.has('a.b.c.2.d')).toBeFalsy()
  expect(modifier.has('a.b.c.3.d')).toBeFalsy()
})

it('should decide existence values using bracket-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c[0]')).toBeTruthy()
  expect(modifier.has('a.b.c[1]')).toBeTruthy()
  expect(modifier.has('a.b.c[0].d')).toBeFalsy()
  expect(modifier.has('a.b.c[1].d')).toBeFalsy()
})

it('should decide not-existence values using non-existing bracket-notated key with array', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c[2]')).toBeFalsy()
  expect(modifier.has('a.b.c[3]')).toBeFalsy()
  expect(modifier.has('a.b.c[2].d')).toBeFalsy()
  expect(modifier.has('a.b.c[3].d')).toBeFalsy()
})

it('should decide existence values using dot-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('a.b.c.0')).toBeTruthy()
  expect(modifier.has('a.b.c.1')).toBeTruthy()
  expect(modifier.has('a.b.c.0.d')).toBeFalsy()
  expect(modifier.has('a.b.c.1.d')).toBeFalsy()
  expect(modifier.has('a.b.c.1.e')).toBeTruthy()
})

it('should decide not-existence values using non-existing dot-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('a.b.c.2')).toBeFalsy()
  expect(modifier.has('a.b.c.3')).toBeFalsy()
  expect(modifier.has('a.b.c.2.d')).toBeFalsy()
  expect(modifier.has('a.b.c.3.d')).toBeFalsy()
  expect(modifier.has('a.b.c.2.e')).toBeFalsy()
  expect(modifier.has('a.b.c.3.e')).toBeFalsy()
})

it('should decide existence values using bracket-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c[0]')).toBeTruthy()
  expect(modifier.has('a.b.c[1]')).toBeTruthy()
  expect(modifier.has('a.b.c[0].d')).toBeFalsy()
  expect(modifier.has('a.b.c[1].d')).toBeFalsy()
  expect(modifier.has('a.b.c[1].e')).toBeTruthy()
})

it('should decide not-existence values using non-existing bracket-notated key with array and object', () => {
  const target = {
    a: {
      b: {
        c: ['d', { e: 'f' }],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b.c[2]')).toBeFalsy()
  expect(modifier.has('a.b.c[3]')).toBeFalsy()
  expect(modifier.has('a.b.c[2].d')).toBeFalsy()
  expect(modifier.has('a.b.c[3].d')).toBeFalsy()
  expect(modifier.has('a.b.c[2].e')).toBeFalsy()
  expect(modifier.has('a.b.c[3].e')).toBeFalsy()
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

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('0')).toBeTruthy()
  expect(modifier.has('1')).toBeTruthy()
  expect(modifier.has('0.a')).toBeTruthy()
  expect(modifier.has('1.c')).toBeTruthy()
  expect(modifier.has('0.b')).toBeFalsy()
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

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  expect(modifier.has('2')).toBeFalsy()
  expect(modifier.has('3')).toBeFalsy()
  expect(modifier.has('2.a')).toBeFalsy()
  expect(modifier.has('3.c')).toBeFalsy()
})

it('should decide non-existence values in empty object | array inside array', () => {
  const target = {
    a: {
      b: [{}],
      c: [[]],
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  expect(modifier.has('a.b[0]')).toBeTruthy()
  expect(modifier.has('a.b[0].d')).toBeFalsy()
  expect(modifier.has('a.c[0]')).toBeTruthy()
  expect(modifier.has('a.c[0][0]')).toBeFalsy()
})

it('should decide existence key of "undefined" values with default option', () => {
  const target = {
    a: {
      b: undefined,
    },
  }

  const modifier = toModifier(target)

  expect(modifier.has('a.b')).toBeTruthy()
  expect(modifier.has('a.c')).toBeFalsy()
})

it('should decide existence key of "undefined" values with "treatUndefinedAsNonexistent" option', () => {
  const target = {
    a: {
      b: undefined,
    },
  }

  const modifier = toModifier(target, { treatUndefinedAsNonexistent: false })

  expect(modifier.has('a.b')).toBeFalsy()
  expect(modifier.has('a.c')).toBeFalsy()
})

it('should return true for empty-string key', () => {
  expect(toModifier({ a: 'b' }).has('')).toBeTruthy()
})
