import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducers,
  EntityUseCase,
} from '@/types';

export interface CreateEntityReducersOwnOptions<T> {
  onChange?(newEntity: T, prevEntity: T): void;

  onGenerate?(entity: T, result: unknown): unknown;
}

export type CreateEntityReducersOptions<T, TOptions extends object> = TOptions & CreateEntityReducersOwnOptions<T>;

export type CreateEntityReducersOptionsWithDefaults<T, TOptions extends object> = CreateEntityReducersOptions<
  T,
  TOptions
> &
  Required<Pick<CreateEntityReducersOwnOptions<T>, 'onGenerate'>>;

export type SmoothEntityReducer<T, TReducer> = TReducer extends (
  entity: infer TEntity,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<TEntity, infer TResult>
    ? (entity: TEntity, ...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<TEntity, infer TResult>
    ? (entity: TEntity, ...args: TArgs) => EntityGeneratorValues<T, TResult>
    : (entity: TEntity, ...args: TArgs) => TReturn
  : never;

export type SmoothedEntityReducers<T, TReducers extends EntityReducers<T>> = {
  [K in keyof TReducers]: SmoothEntityReducer<T, TReducers[K]>;
};

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

export type ScopedEntityReducers<T, TReducers extends EntityReducers<T>> = {
  [K in keyof TReducers]: ScopedEntityReducer<T, TReducers[K]>;
};

export type ArrayifyEntityReducers<T> = [T['setEntity' & keyof T], T] & T;

export interface EntityReducersCreator {
  <T, TReducers extends EntityReducers<T>, TResultReducers = SmoothedEntityReducers<T, TReducers>>(
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>>
  ): ArrayifyEntityReducers<TResultReducers>;

  <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TResultReducers = SmoothedEntityReducers<T, TReducers>
  >(
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
    options: TOptions
  ): ArrayifyEntityReducers<TResultReducers>;

  <T, TReducers extends EntityReducers<T>, TResultReducers = ScopedEntityReducers<T, TReducers>>(
    entity: T,
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>>
  ): ArrayifyEntityReducers<TResultReducers>;

  <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TResultReducers = ScopedEntityReducers<T, TReducers>
  >(
    entity: T,
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
    options: TOptions
  ): ArrayifyEntityReducers<TResultReducers>;
}

export interface EntityReducerReducers {
  createEntityReducers: EntityReducersCreator;
}
