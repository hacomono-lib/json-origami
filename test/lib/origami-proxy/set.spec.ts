/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { it, expect } from 'vitest'
import { createEmptyProxy, toProxy, toRaw } from '../../../src/lib/origami-proxy'

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

  expect(toRaw(proxy.value)).toEqual({
    a: { b: { c: 'd' } },
    e: { f: { g: 'h' } },
    i: { j: { k: 'l' } }
  })
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

  expect(toRaw(proxy.value)).toEqual({
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

it('should set string-key value to root array', () => {
  const target = [{
    a: {
      b: {
        c: ['d', 'e']
      }
    }
  },
  {
    f: {
      g: {
        h: ['i', 'j']
      }
    }
  }]

  const proxy = toProxy(target, { arrayIndex: 'dot' })

  proxy.value['x.y'] = 'z'

  expect(toRaw(proxy.value)).toEqual({
    0: {
      a: {
        b: {
          c: ['d', 'e']
        }
      }
    },
    1: {
      f: {
        g: {
          h: ['i', 'j']
        }
      }
    },
    x: {
      y: 'z'
    }
  })
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

it('should set some string key and value to empty object', () => {
  const proxy = createEmptyProxy({ arrayIndex: 'dot' })

  proxy.value['a.b.c'] = 'd'

  expect(toRaw(proxy.value)).toEqual({ a: { b: { c: 'd' } } })
})

it('should set some number key and value to empty array', () => {
  const proxy = createEmptyProxy({ arrayIndex: 'dot' })

  proxy.value['0.1.2'] = 3

  expect(toRaw(proxy.value)).toEqual([[undefined, [undefined, undefined, 3]]])
})
