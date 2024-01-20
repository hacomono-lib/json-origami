/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { it, expect } from 'vitest'
import { toProxy, toRaw, origamiMeta } from '../../../src/lib/origami-proxy'

it('should freed memory when the proxy object is finished being used', () => {
  let refA: WeakRef<unknown> | undefined
  let refB: WeakRef<unknown> | undefined

  {
    const target = {
      a: {
        b: {
          c: 'd'
        }
      }
    }

    let proxy = toProxy(target, { arrayIndex: 'bracket' })
    let meta = proxy[origamiMeta]

    let a = toRaw(proxy.value['a'])
    refA = new WeakRef(a)
    let b = toRaw(proxy.value['a.b'])
    refB = new WeakRef(b)

    expect(meta.cache.has(a)).toBeTruthy()
    expect(meta.cache.has(b)).toBeTruthy()
    expect(refA.deref()).toBe(a)
    expect(refB.deref()).toBe(b)

    proxy = undefined as any
    meta = undefined as any
    a = undefined as any
    b = undefined as any
  }

  expect(refA!.deref()).toBeUndefined()
  expect(refB!.deref()).toBeUndefined()
})
