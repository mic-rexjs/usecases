import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  EntityReducer,
  EntityReducers,
  EntityUseCase,
  UseCase,
} from '@/types';

export interface CreateEntityReducersOwnOptions<T> {
  onChange?(newEntity: T, oldEntity: T): void;

  onGenerate?(entity: T, result: unknown): unknown;
}

export type CreateEntityReducersOptions<T, TOptions extends object> = TOptions & CreateEntityReducersOwnOptions<T>;

export type CreateEntityReducersOptionsWithDefaults<T, TOptions extends object> = CreateEntityReducersOptions<
  T,
  TOptions
> &
  Required<Pick<CreateEntityReducersOwnOptions<T>, 'onGenerate'>>;

export type SmoothEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  entity: T,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<T, infer TResult>
    ? (entity: T, ...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<T, infer TResult>
    ? (entity: T, ...args: TArgs) => EntityGeneratorValues<T, TResult>
    : TReducer
  : never;

export type SmoothedEntityReducers<T, TReducers extends EntityReducers<T>> = {
  [K in keyof TReducers]: SmoothEntityReducer<T, TReducers[K]>;
};

export type ScopedEntityReducer<T, TReducer extends EntityReducer<T>> = TReducer extends (
  entity: T,
  ...args: infer TArgs
) => infer TReturn
  ? TReturn extends AsyncEntityGenerator<T, infer TResult>
    ? (...args: TArgs) => AsyncEntityGeneratorValues<T, TResult>
    : TReturn extends EntityGenerator<T, infer TResult>
    ? (...args: TArgs) => EntityGeneratorValues<T, TResult>
    : (...args: TArgs) => TReturn
  : never;

export type ScopedEntityReducers<T, TReducers extends EntityReducers<T>> = {
  [K in keyof TReducers]: ScopedEntityReducer<T, TReducers[K]>;
};

export interface EntityReducersCreator {
  <
    T,
    TEntityReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = SmoothedEntityReducers<T, TEntityReducers>
  >(
    usecase: EntityUseCase<T, TEntityReducers, TUseCaseOptions> &
      /**
       * 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       */
      UseCase<EntityReducers<T>, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>
  ): TReturnedReducers;

  <
    T,
    TEntityReducers extends EntityReducers<T>,
    TUseCaseOptions extends object = object,
    TReturnedReducers = ScopedEntityReducers<T, TEntityReducers>
  >(
    initailEntity: T,
    usecase: EntityUseCase<T, TEntityReducers> &
      /**
       * 1. 如果不使用 `&`，那么很多情况下 `options` 类型无法被正确推导；
       * 因为使用 `&` 是为了让该参数 `usecase` 的泛型 `T` 推导占优先级，
       * 从而保证 `options` 里的泛型 `T` 是根据 `usecase` 来推导的。
       *
       * 2. 以 `TEntityReducers` 代替了 `EntityReducers<T>`，
       * 因为如果使用 `EntityReducers<T>` 则会导致其推导优先级比 `initailEntity` 还高，
       * 这是不应该的，所以要使用不带泛型参数的 `TEntityReducers`。
       *
       * 推导权重等级应该是：`initailEntity` > `usecase` > `options`，
       * 即：以 `initailEntity` 中的泛型 `T` 为准.
       */
      UseCase<TEntityReducers, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>
  ): TReturnedReducers;
}

export interface EntityReducerReducers {
  createEntityReducers: EntityReducersCreator;
}
