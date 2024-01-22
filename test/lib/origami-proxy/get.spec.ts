import { expect, it } from 'vitest'
import { toProxy, toRaw } from '~/lib'

it('should get values by dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.value['a.b.c'])).toBe('d')
  expect(toRaw(proxy.value['a.b'])).toEqual({ c: 'd' })
})

it('should same object when get values by same dot-notated key', () => {
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

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.value['a.b'])).toBe(toRaw(proxy.value['a.b']))
})

it('should get values including array by dot-notated key', () => {
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

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  expect(toRaw(proxy.value['a.b.c'])).toEqual(['d', { e: 'f' }])
  expect(toRaw(proxy.value['a.b.c.0'])).toBe('d')
  expect(toRaw(proxy.value['a.b.c.1'])).toEqual({ e: 'f' })
  expect(toRaw(proxy.value['a.b.c.1.e'])).toBe('f')
})

it('should get values including array by dot-notated key with bracket', () => {
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

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.value['a.b.c'])).toEqual(['d', { e: 'f' }])
  expect(toRaw(proxy.value['a.b.c[0]'])).toBe('d')
  expect(toRaw(proxy.value['a.b.c[1]'])).toEqual({ e: 'f' })
  expect(toRaw(proxy.value['a.b.c[1].e'])).toBe('f')
})

it('should get undefined when access any object with un-existed dot-notated key', () => {
  const target = {
    a: {
      b: {
        c: 'd',
      },
    },
  }

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(proxy.value['e.f.g']).toBeUndefined()
  expect(proxy.x).toBeUndefined()
})

it('should get undefined when access any object including array with un-existed dot-notated key', () => {
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

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  expect(proxy.value['a.b.c.2']).toBeUndefined()
  expect(proxy.value['a.b.c.1.f']).toBeUndefined()
})

it('should get undefined when access any object including array with un-existed dot-notated key with bracket', () => {
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

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(proxy.value['a.b.c[2]']).toBeUndefined()
  expect(proxy.value['a.b.c[1].f']).toBeUndefined()
})

it('should get some value when root array with dot-notated key', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  expect(toRaw(proxy.value['0.a'])).toBe('b')
  expect(toRaw(proxy.value['1.c'])).toBe('d')
})

it('should get some value when root array with dot-notated key with bracket', () => {
  const target = [
    {
      a: 'b',
    },
    {
      c: 'd',
    },
  ]

  const proxy = toProxy(target, { arrayIndex: 'bracket' })

  expect(toRaw(proxy.value['[0]a'])).toBe('b')
  expect(toRaw(proxy.value['[1]c'])).toBe('d')
})
