/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import { toProxy, toRaw } from '../../src/lib/origami-proxy'

describe('get values', () => {
  it('should get values by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })

    expect(toRaw(proxy.value['a.b.c'])).toBe('d')
    expect(toRaw(proxy.value['a.b'])).toEqual({ c: 'd' })
    expect(toRaw(proxy.value['a'])).toEqual({ b: { c: 'd' } })
  })

  it('should same object when get values by same dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: {
            d: {
              e: 'f'
            }
          }
        }
      }
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
              e: 'f'
            }
          ]
        }
      }
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
              e: 'f'
            }
          ]
        }
      }
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
          c: 'd'
        }
      }
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
              e: 'f'
            }
          ]
        }
      }
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
              e: 'f'
            }
          ]
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })

    expect(proxy.value['a.b.c[2]']).toBeUndefined()
    expect(proxy.value['a.b.c[1].f']).toBeUndefined()
  })

  it('should get some value when root array with dot-notated key', () => {
    const target = [
      {
        a: 'b'
      },
      {
        c: 'd'
      }
    ]

    const proxy = toProxy(target, { arrayIndex: 'dot' })

    expect(toRaw(proxy.value['0.a'])).toBe('b')
    expect(toRaw(proxy.value['1.c'])).toBe('d')
  })

  it('should get some value when root array with dot-notated key with bracket', () => {
    const target = [
      {
        a: 'b'
      },
      {
        c: 'd'
      }
    ]

    const proxy = toProxy(target, { arrayIndex: 'bracket' })

    expect(toRaw(proxy.value['[0]a'])).toBe('b')
    expect(toRaw(proxy.value['[1]c'])).toBe('d')
  })
})

describe('set values', () => {
  it('should set primivite value by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })
    proxy.value['a.b.c'] = 'e'

    expect(toRaw(proxy.value['a.b'])).toEqual({ c: 'e' })
    expect(toRaw(proxy.value['a.b.c'])).toBe('e')
    expect(proxy.value.a.b.c).toBe('e')
  })

  it('should set object value by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proxy = toProxy(target, { arrayIndex: 'bracket' }) as any
    proxy.value['a.b'] = { e: 'f' }

    expect(toRaw(proxy.value['a.b'])).toEqual({ e: 'f' })
    expect(proxy.value['a.b.e']).toBe('f')

    proxy.value['a.b.e'] = 'g'
    expect(proxy.value.a.b.e).toBe('g')
  })

  it('should set array value by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: ['d', 'e']
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'dot' })
    proxy.value['a.b.c.0'] = 'f'

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', 'e'])
    expect(proxy.value['a.b.c.0']).toBe('f')

    proxy.value['a.b.c.1'] = ['g', 'h']

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', ['g', 'h']])
    expect(proxy.value['a.b.c.1.0']).toBe('g')

    proxy.value['a.b.c.1.1'] = { i: 'j' }

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', ['g', { i: 'j' }]])
    expect(proxy.value['a.b.c.1.1.i']).toBe('j')
  })

  it('should set array value by dot-notated key with bracket', () => {
    const target = {
      a: {
        b: {
          c: ['d', 'e']
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })
    proxy.value['a.b.c[0]'] = 'f'

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', 'e'])
    expect(proxy.value['a.b.c[0]']).toBe('f')

    proxy.value['a.b.c[1]'] = ['g', 'h']

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', ['g', 'h']])
    expect(proxy.value['a.b.c[1][0]']).toBe('g')

    proxy.value['a.b.c[1][1]'] = { i: 'j' }

    expect(toRaw(proxy.value['a.b.c'])).toEqual(['f', ['g', { i: 'j' }]])
    expect(proxy.value['a.b.c[1][1].i']).toBe('j')
  })

  it('should set object value to un-existed key by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })

    proxy.value['e.f.g'] = 'h'

    expect(proxy.value['e.f.g']).toBe('h')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((target as any).e?.f?.g).toBeUndefined()

    proxy.value['i.j'] = { k: 'l' }

    expect(toRaw(proxy.value['i.j'])).toEqual({ k: 'l' })
    expect(toRaw(proxy.value['i.j.k'])).toBe('l')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((target as any).i?.j).toBeUndefined()

    expect(proxy.raw).toEqual({ a: { b: { c: 'd' } }, e: { f: { g: 'h' } }, i: { j: { k: 'l' } } })
  })

  it('should set value to un-existed array key by dot-notated key', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'dot' })

    proxy.value['e.f.0'] = ['g', 'h']

    expect(toRaw(proxy.value['e.f'])).toEqual([['g', 'h']])
    expect(toRaw(proxy.value['e.f.0'])).toEqual(['g', 'h'])

    proxy.value['i.j.3.4'] = 'k'

    expect(toRaw(proxy.value['i.j'])).toEqual([
      undefined,
      undefined,
      undefined,
      [undefined, undefined, undefined, undefined, 'k']
    ])
    expect(toRaw(proxy.value['i.j.3.4'])).toBe('k')

    expect(proxy.raw).toEqual({
      a: {
        b: {
          c: 'd'
        }
      },
      e: {
        f: [['g', 'h']]
      },
      i: {
        j: [undefined, undefined, undefined, [undefined, undefined, undefined, undefined, 'k']]
      }
    })
  })

  it('should set value to un-existed array key by dot-notated key with bracket', () => {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'bracket' })

    proxy.value['e.f[0]'] = ['g', 'h']

    expect(toRaw(proxy.value['e.f'])).toEqual([['g', 'h']])
    expect(toRaw(proxy.value['e.f[0]'])).toEqual(['g', 'h'])

    proxy.value['i.j[3][4]'] = 'k'

    expect(toRaw(proxy.value['i.j'])).toEqual([
      undefined,
      undefined,
      undefined,
      [undefined, undefined, undefined, undefined, 'k']
    ])
    expect(toRaw(proxy.value['i.j[3][4]'])).toBe('k')
  })

  it('should set string-key value to array', () => {
    const target = {
      a: {
        b: {
          c: ['d', 'e']
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'dot' })

    proxy.value['a.b.c.f'] = 'g'

    expect(toRaw(proxy.value['a.b.c'])).toEqual({ 0: 'd', 1: 'e', f: 'g' })
    expect(Array.isArray(toRaw(proxy.value['a.b.c']))).toBeFalsy()
  })

  it('should set number-key value to object', () => {
    const target = {
      a: {
        b: {
          c: {
            d: 'e'
          }
        }
      }
    }

    const proxy = toProxy(target, { arrayIndex: 'dot' })

    proxy.value['a.b.c.0'] = 'f'

    expect(toRaw(proxy.value['a.b.c'])).toEqual({ 0: 'f', d: 'e' })
    expect(Array.isArray(toRaw(proxy.value['a.b.c']))).toBeFalsy()
  })
})

describe.skip('delete values')
