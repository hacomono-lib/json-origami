interface SplitHeadResult {
  /**
   * The first part of the string before the split.
   */
  head: string | number

  /**
   * The next head of the string after the split.
   */
  nextHead?: string | number

  /**
   * The remaining part of the string after the split.
   */
  rest?: string
}

interface SplitTailResult {
  /**
   * The last part of the string after the split.
   */
  tail: string | number

  /**
   * The remaining part of the string after the split.
   */
  remainder: string
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
export function splitHead(key: string, { arrayIndex }: SplitOption): SplitHeadResult {
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

  return { head, rest: tail, nextHead: pickHead(tail) }
}

/**
 * bracket mode:
 * `a.b.c` -> `[{ tail: 'c', remainder: 'a.b' }, { tail: 'b', remainder: 'a' }]`
 * `a.b[0]` -> `[{ tail: 0, remainder: 'a.b' }, { tail: 'b', remainder: 'a' }]`
 * `a[0][1]` -> `[{ tail: 1, remainder: 'a[0]' }, { tail: 0, remainder: 'a' }]`
 *
 * dot mode:
 * `a.b.c` -> `[{ tail: 'c', remainder: 'a.b' }, { tail: 'b', remainder: 'a' }]`
 * `a.b.0` -> `[{ tail: 0, remainder: 'a.b' }, { tail: 'b', remainder: 'a' }]`
 * `a.0.1` -> `[{ tail: 1, remainder: 'a.0' }, { tail: 0, remainder: 'a' }]`
 */
export function splitTails(key: string, { arrayIndex }: SplitOption): SplitTailResult[] {
  const parts = key.split('.').reduce(
    (acc, part) => {
      const parseNumIfNeeded = (key: string) => {
        const parsed = Number.parseInt(key)
        if (Number.isNaN(parsed)) {
          return key
        }
        return parsed
      }

      if (arrayIndex === 'bracket' && part.includes('[')) {
        const [key = '', ...indexes] = part.split('[')
        if (key !== '') {
          acc.push(key)
        }
        for (const index of indexes) {
          acc.push(parseNumIfNeeded(index))
        }
        return acc
      }

      acc.push(parseNumIfNeeded(part))
      return acc
    },
    [] as (string | number)[],
  )

  const results: SplitTailResult[] = []
  for (let i = parts.length - 1; i > 0; i--) {
    const remainder = parts
      .slice(0, i)
      .map((k) => (typeof k === 'number' && arrayIndex === 'bracket' ? `[${k}]` : `.${k}`))
      .join('')

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const tail = parts[i]!
    results.push({ tail, remainder: remainder.startsWith('.') ? remainder.slice(1) : remainder })
  }

  return results
}
