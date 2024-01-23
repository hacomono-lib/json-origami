import { describe, expect, it } from 'vitest'
import { toProxy } from '~/lib'

function nullable<T>(target: T): T | null {
  return target
}

function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}

describe.sequential('memory leak test', () => {
  it('should freed memory when the proxy object is finished being used', async () => {
    let target = nullable({
      a: {
        b: {
          c: 'd',
        },
      },
    })

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const targetProxy = new WeakRef(toProxy(target!, { arrayIndex: 'bracket' }))

    expect(targetProxy.deref()).not.toBeUndefined()

    target = null

    await tick()

    if (!global.gc) {
      throw new Error('GC is not available')
    }

    global.gc()

    expect(targetProxy.deref()).toBeUndefined()
  })

  it('should freed memory when the inside proxy object is finished being used', async () => {
    let target = nullable({
      a: {
        b: {
          c: 'd',
        },
      },
    })

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    let proxy = nullable(toProxy(target!, { arrayIndex: 'bracket' }))

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const targetA = new WeakRef(proxy!.value.a)
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const targetB = new WeakRef(proxy!.value['a.b'])

    expect(targetA.deref()).not.toBeUndefined()
    expect(targetB.deref()).not.toBeUndefined()

    proxy = null
    target = null

    await tick()

    if (!global.gc) {
      throw new Error('GC is not available')
    }

    global.gc()

    expect(targetA.deref()).toBeUndefined()
    expect(targetB.deref()).toBeUndefined()
  })
})
