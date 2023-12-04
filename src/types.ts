declare const reducerTag: unique symbol;

export type RestArguments = IArguments[number][];

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

export type TypedEntityGenerator<T, TResult> = EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>;

export type EntityGeneratorValues<T, TResult> = [entity: T, result: TResult];

export type AsyncEntityGeneratorValues<T, TResult> = Promise<EntityGeneratorValues<T, TResult>>;

export interface SetEntityCallback<T> {
  (currentEntity: T): T;
}

export type SettableEntity<T> = T | SetEntityCallback<T>;

export interface EntityReducer<T, TReturn = unknown> {
  (entity: T, ...args: RestArguments): TReturn;
}

export interface EntityReducerMap<T> extends ReducerMap<EntityReducer<T>> {}

export type BaseEntityReducers<T> = {
  setEntity<S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S>;

  readonly [reducerTag]?: unique symbol;
};

export type EntityReducers<
  T,
  TReducers extends EntityReducerMap<T> = EntityReducerMap<T>,
  TExtends extends EntityReducerMap<T> = BaseEntityReducers<T>
> = Reducers<TReducers, TExtends>;

export interface EntityUseCase<
  T,
  TReducers extends EntityReducerMap<T> = BaseEntityReducers<T>,
  TOptions extends object = object
> extends UseCase<TReducers, TOptions> {}
