import { expect, it } from 'vitest'
import { origamiMeta, toProxy, toRaw } from '~/lib'

it('should freed memory when the proxy object is finished being used', () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let refA: WeakRef<any> | undefined
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let refB: WeakRef<any> | undefined

  {
    const target = {
      a: {
        b: {
          c: 'd',
        },
      },
    }

    let proxy = toProxy(target, { arrayIndex: 'bracket' })
    let meta = proxy[origamiMeta]

    let a = toRaw(proxy.value.a)
    refA = new WeakRef(a)
    let b = toRaw(proxy.value['a.b'])
    refB = new WeakRef(b)

    expect(meta.cache.has(a)).toBeTruthy()
    expect(meta.cache.has(b)).toBeTruthy()
    expect(refA.deref()).toBe(a)
    expect(refB.deref()).toBe(b)

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    proxy = undefined as any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    meta = undefined as any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    a = undefined as any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    b = undefined as any
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  expect(refA!.deref()).toBeUndefined()
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  expect(refB!.deref()).toBeUndefined()
})
