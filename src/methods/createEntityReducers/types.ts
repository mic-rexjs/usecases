import { EntityStore } from '@/classes/EntityStore';
import {
  AsyncEntityCallbackGenerator,
  AsyncEntityGenerator,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducer,
  EntityReducerMap,
  InferableEntityUseCase,
  ReducerKeys,
} from '@/types';

export interface CreateEntityReducersOwnOptions<T> {
  onCreate?(newEntity: T, oldEntity?: T): T;

  onYield?(newEntity: T, oldEntity?: T): T;

  onReturn?(result: unknown): unknown;

  onGenerate?(entity: T, result: unknown): unknown;
}

export type CreateEntityReducersOptions<T, TOptions extends object> = TOptions & CreateEntityReducersOwnOptions<T>;

export type SmoothedEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  // 不能使用 `entity: T`， 因为 `TEntity` 不完全等于 `T`
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends EntityGenerator<TEntity, infer TResult, infer _TYield>
    ? (entity: TEntity, ...args: TArgs) => EntityGeneratorValues<TEntity, TResult>
    : TReturn extends
          | AsyncEntityGenerator<TEntity, infer TResult, infer _TYield>
          | AsyncEntityCallbackGenerator<TEntity, infer TResult, infer _TYield>
      ? (entity: TEntity, ...args: TArgs) => Promise<EntityGeneratorValues<TEntity, TResult>>
      : TReducer
  : never;

export type SmoothedEntityReducers<T, TEntityReducers extends EntityReducerMap<T>> = {
  [K in ReducerKeys<TEntityReducers>]: SmoothedEntityReducer<T, TEntityReducers[K]>;
};

export type ScopedEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  // 不能使用 `entity: T`， 因为 `TEntity` 不完全等于 `T`
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends EntityGenerator<TEntity, infer TResult, infer _TYield>
    ? (...args: TArgs) => EntityGeneratorValues<TEntity, TResult>
    : TReturn extends
          | AsyncEntityGenerator<TEntity, infer TResult, infer _TYield>
          | AsyncEntityCallbackGenerator<TEntity, infer TResult, infer _TYield>
      ? (...args: TArgs) => Promise<EntityGeneratorValues<TEntity, TResult>>
      : (...args: TArgs) => TReturn
  : never;

export type ScopedEntityReducers<T, TEntityReducers extends EntityReducerMap<T>> = {
  [K in ReducerKeys<TEntityReducers>]: ScopedEntityReducer<T, TEntityReducers[K]>;
};

export interface EntityReducersCreator {
  <
    T,
    TEntityReducers extends EntityReducerMap<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = SmoothedEntityReducers<T, TEntityReducers>,
  >(
    usecase: InferableEntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
  ): TReturnedReducers;

  <
    T,
    TEntityReducers extends EntityReducerMap<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = ScopedEntityReducers<T, TEntityReducers>,
  >(
    initailEntity: T | EntityStore<T>,
    usecase: InferableEntityUseCase<T, TEntityReducers, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
  ): TReturnedReducers;
}
