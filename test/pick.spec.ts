/* eslint-disable max-lines */
import { it, expect } from 'vitest'
import { pick } from '../src/pick'

it('should pick specified keys from the object', () => {
  const obj = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
      e: {
        f: 5,
        g: 6
      }
    }
  }
  const result = pick(obj, ['a', 'b.c', 'b.d', 'b.e.f'])
  expect(result).toEqual({
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
      e: {
        f: 5
      }
    }
  })
})

it('should handle arrays correctly (bracket mode)', () => {
  const obj = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
      e: {
        f: 5,
        g: 6
      }
    }
  }
  const result = pick(obj, ['b.d[0]'])
  expect(result).toEqual({
    b: {
      d: [3]
    }
  })
})

it('should handle arrays correctly (dot mode)', () => {
  const obj = {
    a: 1,
    b: {
      c: 2,
      d: [3, 4],
      e: {
        f: 5,
        g: 6
      }
    }
  }
  const result = pick(obj, ['b.d[0]'])
  expect(result).toEqual({
    b: {
      d: [3]
    }
  })
})

it('should handle keys that are prefixes of other keys', () => {
  const obj = {
    a: 1,
    ab: 2,
    abc: 3
  }
  const result = pick(obj, ['a', 'ab'])
  expect(result).toEqual({
    a: 1,
    ab: 2
  })
})

it('should handle keys that are prefixes of nested other keys', () => {
  const obj = {
    a: {
      b: 1
    },
    ab: {
      b: 2
    },
    abc: {
      b: 3
    }
  }
  const result = pick(obj, ['a', 'ab.b'])
  expect(result).toEqual({
    a: { b: 1 },
    ab: { b: 2 }
  })
})

it('should handle keys that are suffixes of other keys', () => {
  const obj = {
    a: 1,
    ba: 2,
    cba: 3
  }
  const result = pick(obj, ['a', 'ba'])
  expect(result).toEqual({
    a: 1,
    ba: 2
  })
})

it('should handle RegExp keys', () => {
  const obj = {
    a: {
      b: {
        cde: 1
      },
      bc: {
        de: 2
      },
      bcd: {
        e: 3
      }
    },
    ab: {
      c: {
        de: 4
      },
      cd: {
        e: 5
      }
    },
    abc: {
      d: {
        e: 6
      }
    }
  }
  const result = pick(obj, [/^a\.b/, /\.e$/])
  expect(result).toEqual({
    a: {
      b: {
        cde: 1
      },
      bc: {
        de: 2
      },
      bcd: {
        e: 3
      }
    },
    ab: {
      cd: {
        e: 5
      }
    },
    abc: {
      d: {
        e: 6
      }
    }
  })
})
