import { describe, it, assertType } from 'vitest'
import type { DeepKeyOf } from '../src/type'

describe('DeepKeyOf', () => {
  it('should returns nested object keys', () => {
    type D = {
      a: {
        b: {
          c: number
        },
        d: string
      }
    }

    assertType<'a.b.c' | 'a.d'>('' as DeepKeyOf<D>)
  })

  it('should returns nested array keys', () => {
    type D = {
      a: {
        b: [
          number,
          { c: string }
        ]
      }
    }

    assertType<'a.b[0]' | 'a.b[1]c'>('' as DeepKeyOf<D>)
  })

  it('should returns nested array keys (dot)', () => {
    type D = {
      a: {
        b: [
          number,
          { c: string }
        ]
      }
    }

    assertType<'a.b.0' | 'a.b.1.c'>('' as DeepKeyOf<D, 'dot'>)
  })
})
