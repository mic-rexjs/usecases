import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducers,
  EntityUseCase,
  UseCase,
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

export type SmoothEntityReducer<T, TReducer> = TReducer extends (entity: T, ...args: infer TArgs) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<T, infer TResult>
    ? (entity: T, ...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<T, infer TResult>
    ? (entity: T, ...args: TArgs) => EntityGeneratorValues<T, TResult>
    : TReducer
  : never;

export type SmoothedEntityReducers<T, TReducers> = {
  [K in keyof TReducers]: SmoothEntityReducer<T, TReducers[K]>;
};

export type ScopedEntityReducer<T, TReducer> = TReducer extends (entity: T, ...args: infer TArgs) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<T, infer TResult>
    ? (...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<T, infer TResult>
    ? (...args: TArgs) => EntityGeneratorValues<T, TResult>
    : (...args: TArgs) => TReturn
  : never;

export type ScopedEntityReducers<T, TReducers> = {
  [K in keyof TReducers]: ScopedEntityReducer<T, TReducers[K]>;
};

export interface EntityReducersCreator {
  <T, TReducers extends EntityReducers<T>, TReturnedReducers = SmoothedEntityReducers<T, TReducers>>(
    usecase: EntityUseCase<T, TReducers>
  ): TReturnedReducers;

  <T, TReducers extends EntityReducers<T>, TReturnedReducers = ScopedEntityReducers<T, TReducers>>(
    entity: T,
    usecase: EntityUseCase<T, TReducers>
  ): TReturnedReducers;

  <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TReturnedReducers = ScopedEntityReducers<T, TReducers>
  >(
    entity: T,
    usecase: EntityUseCase<T, TReducers, TUseCaseOptions> & UseCase<TReducers, TUseCaseOptions>,
    options: TOptions
  ): TReturnedReducers;
}

export interface EntityReducerReducers {
  createEntityReducers<
    T,
    TReducers extends EntityReducers<T>,
    TReturnedReducers = SmoothedEntityReducers<T, TReducers>
  >(
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>>
  ): TReturnedReducers;

  createEntityReducers<
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TReturnedReducers = SmoothedEntityReducers<T, TReducers>
  >(
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
    options: TOptions
  ): TReturnedReducers;

  createEntityReducers<T, TReducers extends EntityReducers<T>, TReturnedReducers = ScopedEntityReducers<T, TReducers>>(
    entity: T,
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>>
  ): TReturnedReducers;

  createEntityReducers<
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TOptions extends CreateEntityReducersOptions<T, TUseCaseOptions> = CreateEntityReducersOptions<T, TUseCaseOptions>,
    TReturnedReducers = ScopedEntityReducers<T, TReducers>
  >(
    entity: T,
    usecase: EntityUseCase<T, TReducers & EntityReducers<T>, TUseCaseOptions>,
    options: TOptions
  ): TReturnedReducers;
}
