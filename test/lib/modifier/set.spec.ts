import { expect, it } from 'vitest'
import { createEmptyModifier, toModifier } from '~/lib'

it('should update primivite value using dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  modifier.set('a.b.c', 'e')

  expect(modifier.get('a.b')).toEqual({ c: 'e' })
  expect(modifier.get('a.b.c')).toBe('e')
})

it('should update object value using dot notations', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const modifier = toModifier(target, { arrayIndex: 'bracket' }) as any
  modifier.set('a.b', { e: 'f' })

  expect(modifier.get('a.b')).toEqual({ e: 'f' })
  expect(modifier.get('a.b.e')).toBe('f')

  modifier.set('a.b.e', 'g')
})

it('should update array value using dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })
  modifier.set('a.b.c.0', 'f')

  expect(modifier.get('a.b.c')).toEqual(['f', 'e'])
  expect(modifier.get('a.b.c.0')).toBe('f')

  modifier.set('a.b.c.1', ['g', 'h'])

  expect(modifier.get('a.b.c')).toEqual(['f', ['g', 'h']])
  expect(modifier.get('a.b.c.1.0')).toBe('g')

  modifier.set('a.b.c.1.1', { i: 'j' })

  expect(modifier.get('a.b.c')).toEqual(['f', ['g', { i: 'j' }]])
  expect(modifier.get('a.b.c.1.1.i')).toBe('j')
})

it('should update array value using bracket notation within dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })
  modifier.set('a.b.c[0]', 'f')

  expect(modifier.get('a.b.c')).toEqual(['f', 'e'])
  expect(modifier.get('a.b.c[0]')).toBe('f')

  modifier.set('a.b.c[1]', ['g', 'h'])

  expect(modifier.get('a.b.c')).toEqual(['f', ['g', 'h']])
  expect(modifier.get('a.b.c[1][0]')).toBe('g')

  modifier.set('a.b.c[1][1]', { i: 'j' })

  expect(modifier.get('a.b.c')).toEqual(['f', ['g', { i: 'j' }]])
  expect(modifier.get('a.b.c[1][1].i')).toBe('j')
})

it('should set object value to non-existent key using dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  modifier.set('e.f.g', 'h')

  expect(modifier.get('e.f.g')).toBe('h')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((target as any).e?.f?.g).toBeUndefined()

  modifier.set('i.j', { k: 'l' })

  expect(modifier.get('i.j')).toEqual({ k: 'l' })
  expect(modifier.get('i.j.k')).toBe('l')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((target as any).i?.j).toBeUndefined()

  expect(modifier.get()).toEqual({
    a: { b: { c: 'd' } },
    e: { f: { g: 'h' } },
    i: { j: { k: 'l' } },
  })
})

it('should set value to non-existent array key using dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  modifier.set('e.f.0', ['g', 'h'])

  expect(modifier.get('e.f')).toEqual([['g', 'h']])
  expect(modifier.get('e.f.0')).toEqual(['g', 'h'])

  modifier.set('i.j.3.4', 'k')

  expect(modifier.get('i.j')).toEqual([
    undefined,
    undefined,
    undefined,
    [undefined, undefined, undefined, undefined, 'k'],
  ])
  expect(modifier.get('i.j.3.4')).toBe('k')

  expect(modifier.get()).toEqual({
    a: {
      b: {
        c: 'd',
      },
    },
    e: {
      f: [['g', 'h']],
    },
    i: {
      j: [undefined, undefined, undefined, [undefined, undefined, undefined, undefined, 'k']],
    },
  })
})

it('should set value to non-existent array key using dot notation with bracket', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket' })

  modifier.set('e.f[0]', ['g', 'h'])

  expect(modifier.get('e.f')).toEqual([['g', 'h']])
  expect(modifier.get('e.f[0]')).toEqual(['g', 'h'])

  modifier.set('i.j[3][4]', 'k')

  expect(modifier.get('i.j')).toEqual([
    undefined,
    undefined,
    undefined,
    [undefined, undefined, undefined, undefined, 'k'],
  ])
  expect(modifier.get('i.j[3][4]')).toBe('k')
})

it('should set value to array using string key', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  modifier.set('a.b.c.f', 'g')

  expect(modifier.get('a.b.c')).toEqual({ 0: 'd', 1: 'e', f: 'g' })
  expect(Array.isArray(modifier.get('a.b.c'))).toBeFalsy()
})

it('should set string-key value to root array', () => {
  const target = [
    {
      a: {
        b: {
          c: ['d', 'e'],
        },
      },
    },
    {
      f: {
        g: {
          h: ['i', 'j'],
        },
      },
    },
  ]

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  modifier.set('x.y', 'z')

  expect(modifier.get()).toEqual({
    0: {
      a: {
        b: {
          c: ['d', 'e'],
        },
      },
    },
    1: {
      f: {
        g: {
          h: ['i', 'j'],
        },
      },
    },
    x: {
      y: 'z',
    },
  })
})

it('should set number-key value to object', () => {
  const target = {
    a: {
      b: {
        c: {
          d: 'e',
        },
      },
    },
  }

  const modifier = toModifier(target, { arrayIndex: 'dot' })

  modifier.set('a.b.c.0', 'f')

  expect(modifier.get('a.b.c')).toEqual({ 0: 'f', d: 'e' })
  expect(Array.isArray(modifier.get('a.b.c'))).toBeFalsy()
})

it('should initialize as object whe nroot key is string', () => {
  const modifier = createEmptyModifier({ arrayIndex: 'dot' })

  modifier.set('a.b.c', 'd')

  expect(modifier.get()).toEqual({ a: { b: { c: 'd' } } })
})

it('should initialize as array when root key is numeric', () => {
  const modifier = createEmptyModifier({ arrayIndex: 'dot' })

  modifier.set('0.1.2', 3)

  expect(modifier.get()).toEqual([[undefined, [undefined, undefined, 3]]])
})

it('should prune undefined values when setting undefined to an array', () => {
  const target = {
    a: ['b', 'c', 'd'],
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket', pruneNil: true })
  modifier.set('a[0]', undefined)

  expect(modifier.finalize()).toEqual({
    a: ['c', 'd'],
  })
})

it('should prune undefined values in arrays when setting an retrieving values', () => {
  const target = {
    a: ['b', undefined, 'c', undefined, 'd'],
  }

  const modifier = toModifier(target, { arrayIndex: 'bracket', pruneNil: true })
  modifier.set('a[10]', 'x')
  modifier.set('a[1]', 'y')

  expect(modifier.finalize()).toEqual({
    a: ['b', 'y', 'c', 'd', 'x'],
  })
})
