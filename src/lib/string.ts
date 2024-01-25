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
 * `a.b.c` -> `{ head: 'a', nextHead: 'b', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: 0, nextHead: 'b', tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a', nextHead: 0, tail: '[0]b.c' }`
 * `[0][1].b.c` -> `{ head: 0, nextHead: 1, tail: '[1].b.c' }`
 *
 * dot mode:
 * `a.b.c` -> `{ head: 'a', nextHead: 'b', tail: 'b.c' }`
 * `[0].b.c` -> `{ head: '[0]', nextHead: 'b', tail: 'b.c' }`
 * `a[0].b.c` -> `{ head: 'a[0]', nextHead: 'b', tail: 'b.c' }`
 * `[0][1].b.c` -> `{ head: '[0][1]', nextHead: 'b', tail: 'b.c' }`
 * `a.0.b.c` -> `{ head: 'a', nextHead: 0, tail: '0.b.c' }`
 */
export function splitHead(key: string, opt: SplitOption): SplitHeadResult {
  const parts = split(key, opt)
  const rest = join(parts.slice(1), opt)
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const head = parts.shift()!
  const nextHead = parts.shift()

  if (rest === '') {
    return { head }
  }

  return { head, nextHead, rest }
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
export function splitTails(key: string, opt: SplitOption): SplitTailResult[] {
  const parts = split(key, opt)

  const results: SplitTailResult[] = []
  for (let i = parts.length - 1; i > 0; i--) {
    const remainder = join(parts.slice(0, i), opt)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const tail = parts[i]!
    results.push({ tail, remainder })
  }

  return results
}

function split(key: string, { arrayIndex }: SplitOption): (string | number)[] {
  return key.split('.').reduce(
    (acc, part) => {
      if (arrayIndex === 'bracket' && part.includes('[')) {
        const [k = '', ...indexes] = part.split('[')
        if (k !== '') {
          acc.push(k)
        }
        for (const index of indexes) {
          const i = coerceNumber(index)
          if (typeof i !== 'number') {
            throw new Error(`Invalid key: ${key}`)
          }
          acc.push(i)
        }
        return acc
      }

      acc.push(coerceNumber(part))
      return acc
    },
    [] as (string | number)[],
  )
}

function join(parts: (string | number)[], { arrayIndex }: SplitOption): string {
  const joined = parts
    .map((part) => (typeof part === 'number' && arrayIndex === 'bracket' ? `[${part}]` : `.${part}`))
    .join('')

  const fixed = joined.startsWith('.') ? joined.slice(1) : joined
  return fixed
}

function coerceNumber(key: string): string | number {
  const parsed = Number.parseInt(key)
  if (Number.isNaN(parsed)) {
    return key
  }
  return parsed
}
