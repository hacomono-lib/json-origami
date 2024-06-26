// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type DictionaryLeaf = string | number | boolean | {} | [] | Function | null | undefined | symbol | bigint

type DictionaryValue = DictionaryLeaf | Dictionary

type DictionaryObject = { [Key in string]: DictionaryValue } & { [Key in string]?: DictionaryValue | undefined }

type DictionaryArray = DictionaryValue[] | readonly DictionaryValue[]

/**
 *
 */
export type Dictionary = DictionaryObject | DictionaryArray

/**
 * TODO: 深い階層のキーに対応する
 */
export type DeepKeyOf<_D extends Dictionary> = string

/**
 *
 */
export type Folded<_D extends Dictionary> = Record<string, DictionaryLeaf>

/**
 *
 */
export type MoveMap<D extends Dictionary> = Record<DeepKeyOf<D>, string>

/**
 *
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Unfolded<Kv extends Folded<any>> = Kv extends Folded<infer D> ? D : Dictionary

/**
 *
 */
export type Twist<D extends Dictionary, _M extends MoveMap<D>> = Dictionary

/**
 *
 */
export type Omit<D extends Dictionary, _K extends DeepKeyOf<D>> = Dictionary

/**
 *
 */
export type Pick<D extends Dictionary, _K extends DeepKeyOf<D>> = Dictionary

/**
 *
 */
export type ArrayIndex = 'dot' | 'bracket'

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
  arrayIndex: 'bracket' as ArrayIndex,
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
  pruneArray: true,
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

/**
 *
 */
export interface KeysOption extends CommonOption {}

export type FixedKeysOption = Readonly<KeysOption & typeof defaultCommonOption>

export interface HasOption extends CommonOption {
  /**
   * Trait keys with "undefined" value as nonexistent.
   * @default true
   */
  treatUndefinedAsNonexistent?: boolean
}

export const defaultHasOption = {
  ...defaultCommonOption,
  treatUndefinedAsNonexistent: true,
} satisfies HasOption

export type FixedHasOption = Readonly<HasOption & typeof defaultHasOption>
