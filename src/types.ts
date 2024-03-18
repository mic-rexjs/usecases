declare const symbolSetKey: unique symbol;

export type ReducerKeys<T> = keyof T & string;

// 不能使用 `IArguments[number][]`，因为它不能满足模式： `[x: number, ...args: Parameters<T[K]>]`
export type RestArguments = IArguments[number];

export type ToType<T> = Omit<T, never>;

export interface SymbolSet {
  readonly normal: unique symbol;
}

export interface EntitySymbolSet extends SymbolSet {
  readonly entity: unique symbol;
}

export interface GlobalSymbolSet extends EntitySymbolSet {
  readonly global: unique symbol;
}

export interface SymbolSetTarget<T = SymbolSet> {
  readonly [symbolSetKey]?: T;
}

export interface EntitySymbolSetTarget extends SymbolSetTarget<EntitySymbolSet> {}

export interface GlobalSymbolSetTarget extends SymbolSetTarget<GlobalSymbolSet> {}

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
> = ToType<SymbolSetTarget> & TExtends & T;

export interface UseCase<T extends ReducerMap, TOptions extends object = object> {
  (options?: TOptions): T;
}

export interface YieldEntityCallbackWithOptionalEntity<T> {
  (entity?: T): T;
}

export interface YieldEntityCallbackWithRequiredEntity<T> {
  (entity: T): T;
}

export type YieldEntityCallback<T> =
  | YieldEntityCallbackWithOptionalEntity<T>
  | YieldEntityCallbackWithRequiredEntity<T>;

export interface EntityGenerator<T, TResult> extends Generator<T | YieldEntityCallback<T>, TResult, T> {}

export interface AsyncEntityGenerator<T, TResult> extends AsyncGenerator<T | YieldEntityCallback<T>, TResult, T> {}

export type EntityGeneratorValues<T, TResult> = [entity: T, result: TResult];

export interface SetEntityCallback<T> {
  (currentEntity: T): T;
}

export type SettableEntity<T> = T | SetEntityCallback<T>;

export interface EntityReducer<T, TReturn = unknown> {
  (entity: T, ...args: RestArguments): TReturn;
}

export interface EntityReducerMap<T> extends ReducerMap<EntityReducer<T>> {}

export interface BaseEntityReducers<T> extends BaseReducers {
  setEntity<S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S>;
}

export interface BaseEntityReducerMap<T> extends EntityReducerMap<T>, BaseEntityReducers<T> {}

export type EntityReducers<
  T,
  TCustomReducers extends EntityReducerMap<T> = EntityReducerMap<T>,
  TExtends extends BaseEntityReducerMap<T> = ToType<BaseEntityReducers<T>>,
> = Reducers<TCustomReducers, ToType<EntitySymbolSetTarget> & TExtends>;

export interface EntityUseCase<
  T,
  TEntityReducers extends EntityReducerMap<T> = ToType<BaseEntityReducers<T>>,
  TOptions extends object = object,
> extends UseCase<TEntityReducers, TOptions> {}

export interface BaseGlobalReducers<T> extends BaseEntityReducers<T> {}

export type GlobalReducers<
  T,
  TCustomReducers extends EntityReducerMap<T> = EntityReducerMap<T>,
  TExtends extends BaseEntityReducerMap<T> = ToType<BaseGlobalReducers<T>>,
> = EntityReducers<T, TCustomReducers, ToType<GlobalSymbolSetTarget> & TExtends>;

export interface GlobalUseCase<
  T,
  TGlobalReducers extends EntityReducerMap<T> = ToType<BaseGlobalReducers<T>>,
  TOptions extends object = object,
> extends UseCase<TGlobalReducers, TOptions> {}
