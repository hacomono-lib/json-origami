import { expect, it } from 'vitest'
import { createEmptyProxy, toProxy, toRaw } from '~/lib'

it('should update primivite value using dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  proxy.set('a.b.c', 'e')

  expect(toRaw(proxy.get('a.b'))).toEqual({ c: 'e' })
  expect(toRaw(proxy.get('a.b.c'))).toBe('e')
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
  const proxy = toProxy(target, { arrayIndex: 'bracket' }) as any
  proxy.set('a.b', { e: 'f' })

  expect(toRaw(proxy.get('a.b'))).toEqual({ e: 'f' })
  expect(proxy.get('a.b.e')).toBe('f')

  proxy.set('a.b.e', 'g')
})

it('should update array value using dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'dot' })
  proxy.set('a.b.c.0', 'f')

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', 'e'])
  expect(proxy.get('a.b.c.0')).toBe('f')

  proxy.set('a.b.c.1', ['g', 'h'])

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', ['g', 'h']])
  expect(proxy.get('a.b.c.1.0')).toBe('g')

  proxy.set('a.b.c.1.1', { i: 'j' })

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', ['g', { i: 'j' }]])
  expect(proxy.get('a.b.c.1.1.i')).toBe('j')
})

it('should update array value using bracket notation within dot notation', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })
  proxy.set('a.b.c[0]', 'f')

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', 'e'])
  expect(toRaw(proxy.get('a.b.c[0]'))).toBe('f')

  proxy.set('a.b.c[1]', ['g', 'h'])

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', ['g', 'h']])
  expect(toRaw(proxy.get('a.b.c[1][0]'))).toBe('g')

  proxy.set('a.b.c[1][1]', { i: 'j' })

  expect(toRaw(proxy.get('a.b.c'))).toEqual(['f', ['g', { i: 'j' }]])
  expect(proxy.get('a.b.c[1][1].i')).toBe('j')
})

it('should set object value to non-existent key using dot notation', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  proxy.set('e.f.g', 'h')

  expect(proxy.get('e.f.g')).toBe('h')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((target as any).e?.f?.g).toBeUndefined()

  proxy.set('i.j', { k: 'l' })

  expect(toRaw(proxy.get('i.j'))).toEqual({ k: 'l' })
  expect(toRaw(proxy.get('i.j.k'))).toBe('l')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((target as any).i?.j).toBeUndefined()

  expect(toRaw(proxy)).toEqual({
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

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  proxy.set('e.f.0', ['g', 'h'])

  expect(toRaw(proxy.get('e.f'))).toEqual([['g', 'h']])
  expect(toRaw(proxy.get('e.f.0'))).toEqual(['g', 'h'])

  proxy.set('i.j.3.4', 'k')

  expect(toRaw(proxy.get('i.j'))).toEqual([
    undefined,
    undefined,
    undefined,
    [undefined, undefined, undefined, undefined, 'k'],
  ])
  expect(toRaw(proxy.get('i.j.3.4'))).toBe('k')

  expect(toRaw(proxy)).toEqual({
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

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  proxy.set('e.f[0]', ['g', 'h'])

  expect(toRaw(proxy.get('e.f'))).toEqual([['g', 'h']])
  expect(toRaw(proxy.get('e.f[0]'))).toEqual(['g', 'h'])

  proxy.set('i.j[3][4]', 'k')

  expect(toRaw(proxy.get('i.j'))).toEqual([
    undefined,
    undefined,
    undefined,
    [undefined, undefined, undefined, undefined, 'k'],
  ])
  expect(toRaw(proxy.get('i.j[3][4]'))).toBe('k')
})

it('should set value to array using string key', () => {
  const target = {
    a: {
      b: {
        c: ['d', 'e'],
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  proxy.set('a.b.c.f', 'g')

  expect(toRaw(proxy.get('a.b.c'))).toEqual({ 0: 'd', 1: 'e', f: 'g' })
  expect(Array.isArray(toRaw(proxy.get('a.b.c')))).toBeFalsy()
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

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  proxy.set('x.y', 'z')

  expect(toRaw(proxy)).toEqual({
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

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  proxy.set('a.b.c.0', 'f')

  expect(toRaw(proxy.get('a.b.c'))).toEqual({ 0: 'f', d: 'e' })
  expect(Array.isArray(toRaw(proxy.get('a.b.c')))).toBeFalsy()
})

it('should initialize as object whe nroot key is string', () => {
  const proxy = createEmptyProxy({ arrayIndex: 'dot' })

  proxy.set('a.b.c', 'd')

  expect(toRaw(proxy)).toEqual({ a: { b: { c: 'd' } } })
})

it('should initialize as array when root key is numeric', () => {
  const proxy = createEmptyProxy({ arrayIndex: 'dot' })

  proxy.set('0.1.2', 3)

  expect(toRaw(proxy)).toEqual([[undefined, [undefined, undefined, 3]]])
})
