import {
  AsyncEntityGeneratorValues,
  EntityGeneratorValues,
  EntityReducer,
  EntityReducerMap,
  EntityUseCase,
} from '@/types';
import {
  ScopedEntityReducers,
  CreateEntityReducersOptions,
  SmoothedEntityReducers,
  EntityReducersCreator,
} from './types';
import { generateEntity } from '../generateEntity';
import { EntityStore } from '@/classes/EntityStore';

export const createEntityReducers: EntityReducersCreator = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
  TUseCaseOptions extends object,
  TUseCase extends EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  TReturnedReducers = SmoothedEntityReducers<T, TEntityReducers> | ScopedEntityReducers<T, TEntityReducers>
>(
  arg1: T | TUseCase,
  arg2?: TUseCase | CreateEntityReducersOptions<T, TUseCaseOptions>,
  arg3?: CreateEntityReducersOptions<T, TUseCaseOptions>
): TReturnedReducers => {
  const hasEntity = typeof arg2 === 'function';
  const initialEntity = (hasEntity ? arg1 : null) as T;
  const usecase = (hasEntity ? arg2 : arg1) as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const options = (hasEntity ? arg3 : arg2) as CreateEntityReducersOptions<T, TUseCaseOptions> | undefined;

  const {
    store = new EntityStore(initialEntity),
    onChange,
    onGenerate = <TResult, TReturn = TResult>(newEntity: T, result: TResult): TReturn => {
      return [newEntity, result] as TReturn;
    },
    ...usecaseOptions
  } = options || {};

  const reducers: Partial<TReturnedReducers> = {};
  const originalReducers = usecase(usecaseOptions as TUseCaseOptions);
  const { setEntity } = originalReducers;
  let callingReducer: EntityReducer<T> = setEntity;

  store.watch((currentEntity: T, prevEntity: T): void => {
    let newEntity = currentEntity;

    if (callingReducer !== setEntity) {
      [newEntity] = generateEntity(setEntity(prevEntity, currentEntity));
    }

    onChange?.(newEntity, prevEntity);
  });

  Object.keys(originalReducers).forEach(<TReturn>(key: string): void => {
    const reducer = originalReducers[key] as EntityReducer<T, TReturn>;

    reducers[key as keyof TReturnedReducers] = (<TResult>(
      ...restArgs: Parameters<EntityReducer<T>>
    ): TResult | Promise<TResult> => {
      const reducerArgs = (hasEntity ? [store.getValue(), ...restArgs] : restArgs) as Parameters<EntityReducer<T>>;

      const ret = reducer(...reducerArgs) as TReturn & TResult;
      const iterator = ret?.[Symbol.iterator as keyof TReturn] || ret?.[Symbol.asyncIterator as keyof TReturn];

      callingReducer = reducer;

      if (!hasEntity) {
        store.resetValue(restArgs[0]);
      }

      if (typeof iterator !== 'function') {
        return ret;
      }

      const gen = iterator.call(ret);

      if (gen !== ret) {
        return ret;
      }

      const values = generateEntity(gen, { store }) as
        | EntityGeneratorValues<T, TReturn>
        | AsyncEntityGeneratorValues<T, TReturn>;

      if (values instanceof Promise) {
        return values.then(([newEntity, value]: EntityGeneratorValues<T, TReturn>): TResult => {
          return onGenerate(newEntity, value) as TResult;
        });
      }

      return onGenerate(...values) as TResult;
    }) as TReturnedReducers[keyof TReturnedReducers];
  });

  return reducers as TReturnedReducers;
};
