declare const reducerTag: unique symbol;

// 不能使用 `IArguments[number][]`，因为它不能满足模式： `[x: number, ...args: Parameters<T[K]>]`
export type RestArguments = IArguments[number];

export interface Reducer<T = unknown> {
  (...args: RestArguments): T;
}

export interface ReducerMap<T extends Reducer = Reducer> {
  [k: string]: T;
}

export type BaseReducers = {
  readonly [reducerTag]?: unique symbol;
};

export type Reducers<T extends ReducerMap = ReducerMap, TExtends extends ReducerMap = BaseReducers> = TExtends & T;

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

export interface CustomEntityReducerMap<T> extends ReducerMap<EntityReducer<T>> {}

export type NamedEntityReducerMap<T> = {
  setEntity<S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S>;
};

export interface EntityReducerMap<T> extends CustomEntityReducerMap<T>, NamedEntityReducerMap<T> {}

export type BaseEntityReducers<T> = NamedEntityReducerMap<T> & {
  readonly [reducerTag]?: unique symbol;
};

export type EntityReducers<
  T,
  TEntityReducers extends CustomEntityReducerMap<T> = CustomEntityReducerMap<T>,
  TExtends extends EntityReducerMap<T> = BaseEntityReducers<T>
> = Reducers<TEntityReducers, TExtends>;

export interface EntityUseCase<
  T,
  TEntityReducers extends EntityReducerMap<T> = BaseEntityReducers<T>,
  TOptions extends object = object
> extends UseCase<TEntityReducers, TOptions> {}
