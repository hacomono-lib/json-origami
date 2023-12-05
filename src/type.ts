/**
 *
 */
export type Primitive = string | number | boolean | null | undefined

type MaybeReadonly<T> = T | (T extends Array<infer U> ? readonly U[] : Readonly<T>)

/**
 *
 */
export type Dictionary =
  | MaybeReadonly<Record<string, unknown>>
  | MaybeReadonly<Array<Primitive | Record<string, unknown>>>

export type DeepKeyOf<D extends Dictionary, A extends ArrayIndex = 'bracket'> = FixArrayIndex<
  DeepKeyOfInternal<D>,
  A
>

type DeepKeyOfInternal<D extends Dictionary> = {
  [K in keyof D]: D[K] extends Primitive | Dictionary
    ? `${Exclude<K, symbol>}${D[K] extends Dictionary ? `.${DeepKeyOfInternal<D[K]>}` : ''}`
    : never
}[keyof D]

type A = Exclude<keyof [1, 2, 3], symbol>

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Folded<_D extends Dictionary> = Record<string, Primitive>

/**
 *
 */
export type MoveMap<D extends Dictionary> = Record<DeepKeyOf<D>, string>

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Unfolded<KV extends Folded<any>> = KV extends Folded<infer D> ? D : Dictionary

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Twist<D extends Dictionary, _M extends MoveMap<D>> = Dictionary

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Omit<D extends Dictionary, _K extends DeepKeyOf<D>> = Dictionary

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Pick<D extends Dictionary, _K extends DeepKeyOf<D>> = Dictionary

/**
 *
 */
export type ArrayIndex = 'dot' | 'bracket'

type FixBracket<T extends string> = T extends `${infer L}[${infer R}]` ? `${L}.${R}` : T

type FixDot<T extends string> = T extends `${infer L}.${infer R}` ? `${L}[${R}]` : T

type FixArrayIndex<T extends string, A extends ArrayIndex> = A extends 'dot'
  ? FixDot<T>
  : FixBracket<T>

export interface CommonOption {
  /**
   * Specify the array index style.
   * - `dot`: `a.0.b.1.c`
   * - `bracket`: `a[0].b[1].c`
   *
   * @default 'bracet'
   */
  arrayIndex?: 'dot' | 'bracket'
}

/**
 *
 */
export interface FoldOption extends CommonOption {
  /**
   * Specify the prefix of the key of the result of fold.
   * @default ''
   */
  keyPrefix?: string
}

export const defaultCommonOption = {
  arrayIndex: 'bracket' as ArrayIndex
} satisfies FoldOption

export type FixedFoldOption = Readonly<FoldOption & typeof defaultCommonOption>

/**
 *
 */
export interface UnfoldOption extends CommonOption {
  /**
   * If true, the array will be pruned if it is empty.
   *
   * @example
   * ```ts
   * const kv = {
   *  'a[1]': 1,
   *  'a[3]': 2,
   *  'a[5]': 3
   * }
   *
   * const pruned = unfold(kv, { pruneArray: true })
   * // pruned is { a: [1, 2, 3] }
   *
   * const notPruned = unfold(kv, { pruneArray: false })
   * // notPruned is { a: [undefined, 1, undefined, 2, undefined, 3] }
   * ```
   * @default true
   */
  pruneArray?: boolean
}

export const defaultUnfoldOption = {
  ...defaultCommonOption,
  pruneArray: true
} satisfies UnfoldOption

export type FixedUnfoldOption = Readonly<UnfoldOption & typeof defaultUnfoldOption>

/**
 *
 */
export interface TwistOption extends UnfoldOption {}

export type FixedTwistOption = Readonly<TwistOption & typeof defaultUnfoldOption>

/**
 *
 */
export interface OmitOption extends UnfoldOption {}

export type FixedOmitOption = Readonly<OmitOption & typeof defaultUnfoldOption>

/**
 *
 */
export interface PickOption extends UnfoldOption {}

export type FixedPickOption = Readonly<PickOption & typeof defaultUnfoldOption>
