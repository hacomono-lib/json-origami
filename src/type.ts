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

/**
 *
 */
export interface FoldOption {
  /**
   * @default 'bracet'
   */
  arrayIndex?: 'dot' | 'bracket'
}

export const defaultFoldOption = {
  arrayIndex: 'bracket'
} satisfies FoldOption

export type FixedFoldOption = Readonly<Required<FoldOption>>
