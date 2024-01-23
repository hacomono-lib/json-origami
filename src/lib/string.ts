interface SplitKeyResult {
  head: string | number
  nextHead?: string | number
  tail?: string
}

export interface SplitOption {
  arrayIndex: 'dot' | 'bracket'
}

/**
 * bracket mode:
 * `a.b.c` -> `{ head: 'a', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: 0, tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a', tail: '[0]b.c' }`
 * `[0][1].b.c` -> `{ head: 0, tail: '[1].b.c' }`
 *
 * dot mode:
 * `a.b.c` -> `{ head: 'a', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: '[0]', tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a[0]', tail: 'b.c' }`
 * `[0][1].b.c` -> `{ head: '[0][1]', tail: 'b.c' }`
 */
export function splitKey(key: string, { arrayIndex }: SplitOption): SplitKeyResult {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  function pickHead(target: string): string | number {
    if (arrayIndex === 'bracket' && target.startsWith('[')) {
      const head = (target.match(/^\[(\d+)\]/) ?? [null, null])[1]
      if (head === null) {
        throw new Error(`Invalid key: ${key}`)
      }
      return Number.parseInt(head)
    }

    if (arrayIndex === 'dot') {
      const head = target.split('.')[0]
      if (head === undefined) {
        throw new Error(`Invalid key: ${key}`)
      }
      const intParsed = Number.parseInt(head)
      return `${intParsed}` === head ? intParsed : head
    }

    const head = target.split(/\.|\[/)[0]
    if (head === undefined) {
      throw new Error(`Invalid key: ${key}`)
    }
    return head
  }

  const head = pickHead(key)

  const tail = (() => {
    const headStr = typeof head === 'string' ? head : arrayIndex === 'bracket' ? `[${head}]` : `${head}`

    const omitHead = key.replace(headStr, '')
    if (omitHead.startsWith('.')) {
      return omitHead.slice(1)
    }

    return omitHead
  })()

  const isEnd = tail === '' && !key.endsWith('.')

  if (isEnd) {
    return { head }
  }

  return { head, tail, nextHead: pickHead(tail) }
}
