declare const symbolSetKey: unique symbol;

export type ReducerKeys<T> = keyof T & string;

export type RestArguments = IArguments[number][];

export type ToType<T> = Omit<T, never>;

// 不直接使用 `Partial`，为了在外面看起来意思更明确
// 比如   `EntityGenerator<S, number, Yeild<S>>`，
// 而不是 `EntityGenerator<S, number, Partial<S>>`
export type Yeild<T> = {
  [K in keyof T]?: T[K];
};

export interface SetEntityCallback<T, TReturn = Partial<T>> {
  (currentEntity: T): TReturn;
}

export type SettableEntity<T> = Partial<T> | SetEntityCallback<T>;

export interface SymbolSet {
  readonly normal: unique symbol;
}

export interface EntitySymbolSet extends SymbolSet {
  readonly entity: unique symbol;
}

export interface SymbolSetTarget<T = SymbolSet> {
  /**
   * 目的是让 `Reducers` 与 `EntityReducers` 能基于同一个 `key`，
   * 不然 `key` 不一样，则 `EntityReducers extends Reducers` 就会不成立。
   */
  readonly [symbolSetKey]?: T;
}

export interface EntitySymbolSetTarget extends SymbolSetTarget<EntitySymbolSet> {}

export interface Reducer<T = unknown> {
  (...args: RestArguments): T;
}

export interface ReducerMap<T extends Reducer = Reducer> {
  [k: string]: T;
}

export interface BaseReducers extends SymbolSetTarget<SymbolSet> {}

export type Reducers<
  T extends ReducerMap = ReducerMap,
  TExtends extends ReducerMap = ToType<BaseReducers>,
> = ToType<SymbolSetTarget> & Omit<TExtends, keyof T> & T;

export interface UseCase<T extends ReducerMap, TOptions extends object = object> {
  (options?: TOptions): T;
}

export type InferableUseCase<
  T extends ReducerMap,
  TOptions extends object = object,
  TUseCase extends UseCase<T, TOptions> = UseCase<T, TOptions>,
> = TUseCase & UseCase<T, TOptions>;

export interface YieldEntityCallbackWithOptionalEntity<T, TReturn = T> {
  (entity?: T): TReturn;
}

export interface YieldEntityCallbackWithRequiredEntity<T, TReturn = T> {
  (entity: T): TReturn;
}

export type YieldEntityCallback<T, TReturn = T> =
  | YieldEntityCallbackWithOptionalEntity<T, TReturn>
  | YieldEntityCallbackWithRequiredEntity<T, TReturn>;

export type AsyncYieldEntityCallback<T, TReturn = T> = YieldEntityCallback<T, Promise<TReturn>>;

export interface EntityGenerator<T, TResult, TYield = Yeild<T>> extends Generator<
  TYield | YieldEntityCallback<T, TYield>,
  TResult,
  T
> {}

export interface AsyncEntityGenerator<T, TResult, TYield = Yeild<T>> extends AsyncGenerator<
  TYield | YieldEntityCallback<T, TYield> | AsyncYieldEntityCallback<T, TYield>,
  TResult,
  T
> {}

export interface AsyncEntityCallbackGenerator<T, TResult, TYield = Yeild<T>> extends Generator<
  TYield | YieldEntityCallback<T, TYield> | AsyncYieldEntityCallback<T, TYield>,
  TResult,
  T
> {}

export type EntityGeneratorValues<T, TResult> = [entity: T, result: TResult];

export interface EntityReducer<T, TReturn = unknown> {
  (entity: T, ...args: RestArguments): TReturn;
}

export interface EntityReducerMap<T> extends ReducerMap<EntityReducer<T>> {}

export interface BaseEntityReducers<T> extends BaseReducers {
  // `setEntity` 必须返回 `EntityGenerator<S, S>`
  setEntity<S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S>;
}

export interface BaseEntityReducerMap<T> extends EntityReducerMap<T>, BaseEntityReducers<T> {}

export type EntityReducers<
  T,
  TCustomReducers extends EntityReducerMap<T> = BaseEntityReducerMap<T>,
  TExtends extends BaseEntityReducerMap<T> = ToType<BaseEntityReducers<T>>,
> = Reducers<TCustomReducers, ToType<EntitySymbolSetTarget> & TExtends>;

export interface EntityUseCase<
  T,
  TEntityReducers extends EntityReducerMap<T> = ToType<BaseEntityReducers<T>>,
  TOptions extends object = object,
> extends UseCase<TEntityReducers, TOptions> {}

export type InferableEntityUseCase<
  T,
  TEntityReducers extends EntityReducerMap<T> = ToType<BaseEntityReducers<T>>,
  TOptions extends object = object,
> = EntityUseCase<T, TEntityReducers, TOptions> & UseCase<EntityReducers<T>, TOptions>;
