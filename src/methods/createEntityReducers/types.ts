import { EntityStore } from '@/classes/EntityStore';
import {
  AsyncEntityGenerator,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducer,
  EntityReducers,
  EntityUseCase,
  UseCase,
} from '@/types';

export interface CreateEntityReducersOwnOptions<T> {
  onYield?(newEntity: T, oldEntity?: T): T;

  onReturn?(result: unknown, entity: T): unknown;

  onGenerate?(entity: T, result: unknown): unknown;
}

export type CreateEntityReducersOptions<T, TOptions extends object> = TOptions & CreateEntityReducersOwnOptions<T>;

export type SmoothedEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  // 不能使用 `entity: T`， 因为 `TEntity` 不完全等于 `T`
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
    ? (entity: TEntity, ...args: TArgs) => Promise<EntityGeneratorValues<TEntity, TResult>>
    : TReturn extends EntityGenerator<TEntity, infer TResult>
      ? (entity: TEntity, ...args: TArgs) => EntityGeneratorValues<TEntity, TResult>
      : TReducer
  : never;

export type SmoothedEntityReducers<T, TEntityReducers extends EntityReducers<T>> = {
  [K in keyof TEntityReducers]: SmoothedEntityReducer<T, TEntityReducers[K]>;
};

export type ScopedEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  // 不能使用 `entity: T`， 因为 `TEntity` 不完全等于 `T`
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
    ? (...args: TArgs) => Promise<EntityGeneratorValues<TEntity, TResult>>
    : TReturn extends EntityGenerator<TEntity, infer TResult>
      ? (...args: TArgs) => EntityGeneratorValues<TEntity, TResult>
      : (...args: TArgs) => TReturn
  : never;

export type ScopedEntityReducers<T, TEntityReducers extends EntityReducers<T>> = {
  [K in keyof TEntityReducers]: ScopedEntityReducer<T, TEntityReducers[K]>;
};

export interface EntityReducersCreator {
  <
    T,
    TEntityReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = SmoothedEntityReducers<T, TEntityReducers>,
  >(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<EntityReducers<T>, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
  ): TReturnedReducers;

  <
    T,
    TEntityReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = ScopedEntityReducers<T, TEntityReducers>,
  >(
    initailEntity: T | EntityStore<T>,
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> & UseCase<EntityReducers<T>, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>,
  ): TReturnedReducers;
}
