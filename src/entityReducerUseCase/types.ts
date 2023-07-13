import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducers,
  EntityUseCase,
  UseCase,
} from '../types';

export interface CreateEntityReducersOwnOptions<T> {
  onChange?(newEntity: T, prevEntity: T): void;

  onGenerate?(entity: T, result: unknown): unknown;
}

export type CreateEntityReducersOptions<T, TOptions extends object> = TOptions & CreateEntityReducersOwnOptions<T>;

export type ScopedEntityReducer<T, TReducer> = TReducer extends (
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
    ? (...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<TEntity, infer TResult>
    ? (...args: TArgs) => EntityGeneratorValues<T, TResult>
    : (...args: TArgs) => TReturn
  : never;

export type ScopedEntityReducers<T, TReducers> = {
  [K in keyof TReducers]: ScopedEntityReducer<T, TReducers[K]>;
};

export interface EntityReducerReducers {
  createEntityReducers<
    T,
    TReducers extends EntityReducers<T>,
    TScopedEntityReducers = ScopedEntityReducers<T, TReducers>
  >(
    entity: T,
    usecase: EntityUseCase<T, TReducers>
  ): TScopedEntityReducers;

  createEntityReducers<
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TScopedEntityReducers = ScopedEntityReducers<T, TReducers>
  >(
    entity: T,
    usecase: EntityUseCase<T, TReducers, TUseCaseOptions> & UseCase<TReducers, TUseCaseOptions>,
    options: TOptions
  ): TScopedEntityReducers;
}
