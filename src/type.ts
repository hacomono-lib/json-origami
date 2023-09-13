/**
 *
 */
export type Primitive = string | number | boolean

type MaybeReadonly<T> = T | (T extends Array<infer U> ? readonly U[] : Readonly<T>)

/**
 *
 */
export type Dictionary =
  | MaybeReadonly<Record<string, unknown>>
  | MaybeReadonly<Array<Primitive | Record<string, unknown>>>

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Folded<_D extends Dictionary> = Record<string, Primitive>

/**
 *
 */
export type MoveMap = Record<string, string>

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Unfolded<KV extends Folded<any>> = KV extends Folded<infer D> ? D : Dictionary

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Twist<_D extends Dictionary, _M extends MoveMap> = object

/**
 *
 */
export type ArrayIndex = 'dot' | 'bracket'

interface CommonOption {
  /**
   * @default 'bracet'
   */
  arrayIndex?: 'dot' | 'bracket'
}

/**
 *
 */
export interface FoldOption extends CommonOption {
  /**
   *
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
export interface UnfoldOption extends CommonOption {}

export type FixedUnfoldOption = Readonly<UnfoldOption & typeof defaultCommonOption>

/**
 *
 */
export interface TwistOption extends CommonOption {}

export type FixedTwistOption = Readonly<TwistOption & typeof defaultCommonOption>
