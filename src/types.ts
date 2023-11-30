export interface Reducer<T = unknown> {
  (...args: never[]): T;
}

export interface ReducerMap {
  [k: string]: Reducer;
}

export type Reducers<T extends ReducerMap = ReducerMap, TExtends extends ReducerMap = Record<never, never>> = TExtends &
  T;

export interface UseCase<T extends Reducers, TOptions extends object = object> {
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
  (entity: T, ...args: never[]): TReturn;
}

export interface EntityReducerMap<T> {
  [k: string]: EntityReducer<T>;
}

export type EntityBaseReducers<T> = {
  setEntity<S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S>;
};

export type EntityReducers<
  T,
  TReducers extends EntityReducerMap<T> & Partial<EntityBaseReducers<T>> = EntityReducerMap<T>,
  TExtends extends EntityReducerMap<T> & EntityBaseReducers<T> = EntityBaseReducers<T>
> = Reducers<TReducers, TExtends>;

export interface EntityUseCase<
  T,
  TReducers extends EntityReducers<T> = EntityBaseReducers<T>,
  TOptions extends object = object
> extends UseCase<TReducers, TOptions> {}
