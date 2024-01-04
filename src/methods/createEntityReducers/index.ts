import { EntityReducer, EntityReducerMap, EntityUseCase, RestArguments } from '@/types';
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
  arg1: T | EntityStore<T> | TUseCase,
  arg2?: TUseCase | CreateEntityReducersOptions<T, TUseCaseOptions>,
  arg3?: CreateEntityReducersOptions<T, TUseCaseOptions>
): TReturnedReducers => {
  const hasEntity = typeof arg2 === 'function';
  const initialEntity = (hasEntity ? arg1 : null) as T | EntityStore<T>;
  const store = initialEntity instanceof EntityStore ? initialEntity : new EntityStore(initialEntity);
  const usecase = (hasEntity ? arg2 : arg1) as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const options = (hasEntity ? arg3 : arg2) as CreateEntityReducersOptions<T, TUseCaseOptions> | undefined;
  const { onChange, onGenerate, ...usecaseOptions } = options || {};
  const smoothedReducers: Partial<TReturnedReducers> = {};
  const sourceReducers = usecase(usecaseOptions as TUseCaseOptions);
  const keys = Object.keys(sourceReducers);
  const { setEntity } = sourceReducers;

  keys.forEach(<TReturn>(key: string): void => {
    const reducer = sourceReducers[key] as EntityReducer<T, TReturn>;

    smoothedReducers[key as keyof TReturnedReducers] = (<TResult>(...args: RestArguments): TReturn | TResult => {
      const reducerArgs = (hasEntity ? [store.getValue(), ...args] : args) as [entity: T, ...args: RestArguments];
      const ret = reducer(...reducerArgs);
      const iterator = ret?.[Symbol.iterator as keyof TReturn] || ret?.[Symbol.asyncIterator as keyof TReturn];

      if (!hasEntity) {
        store.resetValue(args[0]);
      }

      if (typeof iterator !== 'function') {
        return ret;
      }

      const gen = iterator.call(ret);

      if (gen !== ret) {
        return ret;
      }

      return generateEntity(gen, {
        store,
        onYield(newEntity: T, oldEntity: T): boolean {
          let entity = newEntity;

          if (reducer !== setEntity) {
            [entity] = generateEntity(setEntity(oldEntity, newEntity));
          }

          store.setValue(entity);
          return true;
        },
        onGenerate,
      }) as TResult;
    }) as TReturnedReducers[keyof TReturnedReducers];
  });

  store.watch((newEntity: T, oldEntity: T): void => {
    onChange?.(newEntity, oldEntity);
  });

  return smoothedReducers as TReturnedReducers;
};
