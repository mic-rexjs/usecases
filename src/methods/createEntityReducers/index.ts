import { generateEntity } from '../generateEntity';
import { isGenerator } from '../isGenerator';
import {
  CreateEntityReducersOptions,
  EntityReducersCreator,
  ScopedEntityReducers,
  SmoothedEntityReducers,
} from './types';
import { EntityStore } from '@/classes/EntityStore';
import { EntityGenerator, EntityReducer, EntityReducerMap, EntityUseCase, ReducerKeys, RestArguments } from '@/types';
import { entityUseCase } from '@/usecases/entityUseCase';

export const createEntityReducers: EntityReducersCreator = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
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
    onCreate,
    onYield = (entity: T): T => {
      return entity;
    },
    onReturn = <TResult>(result: TResult): TResult => {
      return result;
    },
    onGenerate,
    ...usecaseOptions
  } = options || {};

  const smoothedReducers: Partial<TReturnedReducers> = {};
  const entityReducers = entityUseCase();
  const usecaseReducers = usecase(usecaseOptions as TUseCaseOptions);
  const sourceReducers = { ...entityReducers, ...usecaseReducers };
  const keys = Object.keys(sourceReducers);
  const { setEntity } = sourceReducers;

  keys.forEach(<TReturn>(key: string): void => {
    const reducer = sourceReducers[key] as EntityReducer<T, TReturn>;

    smoothedReducers[key as ReducerKeys<TReturnedReducers>] = (<TResult>(...args: RestArguments): TReturn | TResult => {
      const reducerArgs = (hasEntity ? [store.value, ...args] : args) as [entity: T, ...args: RestArguments];
      const ret = reducer(...reducerArgs);

      if (!hasEntity) {
        store.value = args[0];
      }

      if (!isGenerator(ret)) {
        return onReturn(ret) as TResult;
      }

      return generateEntity(ret as EntityGenerator<T, TResult>, {
        store,
        onCreate,
        onYield(newEntity: T, oldEntity?: T): T {
          let entity = newEntity;

          if (reducer !== setEntity) {
            // `setEntity` 不一定会有 `yeild`
            [, entity] = generateEntity(setEntity(oldEntity, newEntity));
          }

          return onYield(entity, oldEntity);
        },
        onGenerate,
      }) as TResult;
    }) as TReturnedReducers[ReducerKeys<TReturnedReducers>];
  });

  return smoothedReducers as TReturnedReducers;
};
