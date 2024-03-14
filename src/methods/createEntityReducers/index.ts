import { EntityGenerator, EntityReducer, EntityReducers, EntityUseCase, RestArguments } from '@/types';
import {
  ScopedEntityReducers,
  CreateEntityReducersOptions,
  SmoothedEntityReducers,
  EntityReducersCreator,
} from './types';
import { generateEntity } from '../generateEntity';
import { EntityStore } from '@/classes/EntityStore';
import { isGenerator } from '../isGenerator';

export const createEntityReducers: EntityReducersCreator = <
  T,
  TEntityReducers extends EntityReducers<T>,
  TUseCaseOptions extends object,
  TUseCase extends EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  TReturnedReducers = SmoothedEntityReducers<T, TEntityReducers> | ScopedEntityReducers<T, TEntityReducers>,
>(
  arg1: T | EntityStore<T> | TUseCase,
  arg2?: TUseCase | CreateEntityReducersOptions<T, TUseCaseOptions>,
  arg3?: CreateEntityReducersOptions<T, TUseCaseOptions>,
): TReturnedReducers => {
  const hasEntity = typeof arg2 === 'function';
  const initialEntity = (hasEntity ? arg1 : null) as T | EntityStore<T>;
  const store = initialEntity instanceof EntityStore ? initialEntity : new EntityStore(initialEntity);
  const usecase = (hasEntity ? arg2 : arg1) as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const options = (hasEntity ? arg3 : arg2) as CreateEntityReducersOptions<T, TUseCaseOptions> | undefined;

  const {
    onYield = (entity: T): T => {
      return entity;
    },
    onReturn,
    onGenerate,
    ...usecaseOptions
  } = options || {};

  const smoothedReducers: Partial<TReturnedReducers> = {};
  const sourceReducers = usecase(usecaseOptions as TUseCaseOptions);
  const keys = Object.keys(sourceReducers);
  const { setEntity } = sourceReducers;

  keys.forEach(<TReturn>(key: string): void => {
    const reducer = sourceReducers[key] as EntityReducer<T, TReturn>;

    smoothedReducers[key as keyof TReturnedReducers] = (<TResult>(...args: RestArguments): TReturn | TResult => {
      const reducerArgs = (hasEntity ? [store.value, ...args] : args) as [entity: T, ...args: RestArguments];
      const ret = reducer(...reducerArgs);

      if (!hasEntity) {
        store.value = args[0];
      }

      if (!isGenerator(ret)) {
        return ret;
      }

      return generateEntity(ret as EntityGenerator<T, TResult>, {
        store,
        onYield(newEntity: T, oldEntity: T): T {
          let entity = newEntity;

          if (reducer !== setEntity) {
            [entity] = generateEntity(setEntity(oldEntity, newEntity));
          }

          return onYield(entity);
        },
        onReturn,
        onGenerate,
      }) as TResult;
    }) as TReturnedReducers[keyof TReturnedReducers];
  });

  return smoothedReducers as TReturnedReducers;
};
