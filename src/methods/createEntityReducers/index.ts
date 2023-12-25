import { EntityGeneratorValues, EntityReducer, EntityReducerMap, EntityUseCase, TypedEntityGenerator } from '@/types';
import {
  ScopedEntityReducers,
  CreateEntityReducersOptions,
  SmoothedEntityReducers,
  EntityReducersCreator,
} from './types';
import { createRef } from '@/methods/createRef';
import { initIterateEntityOptions } from '../initIterateEntityOptions';
import { iterateEntity } from '../iterateEntity';
import { initCreateEntityReducersOptions } from '../initCreateEntityReducersOptions';

export const createEntityReducers: EntityReducersCreator = <
  T,
  TEntityReducers extends EntityReducerMap<T>,
  TUseCaseOptions extends object,
  TUseCase extends EntityUseCase<T, TEntityReducers, TUseCaseOptions>,
  TReturnedReducers extends SmoothedEntityReducers<T, TEntityReducers> | ScopedEntityReducers<T, TEntityReducers>
>(
  arg1: T | TUseCase,
  arg2?: TUseCase | CreateEntityReducersOptions<T, TUseCaseOptions>,
  arg3?: CreateEntityReducersOptions<T, TUseCaseOptions>
): TReturnedReducers => {
  const hasInitialEntity = typeof arg2 === 'function';
  const initialEntity = (hasInitialEntity ? arg1 : null) as T;
  const usecase = (hasInitialEntity ? arg2 : arg1) as EntityUseCase<T, TEntityReducers, TUseCaseOptions>;
  const options = (hasInitialEntity ? arg3 : arg2) as CreateEntityReducersOptions<T, TUseCaseOptions>;
  const { onChange, onGenerate, ...usecaseOptions } = initCreateEntityReducersOptions(options);
  const reducers: Partial<TReturnedReducers> = {};
  const originalReducers = usecase(usecaseOptions as TUseCaseOptions);
  const { setEntity } = originalReducers;
  const entityRef = createRef(initialEntity);
  const reducerRef = createRef<EntityReducer<T>>(setEntity);
  const iterateEntityOptions = initIterateEntityOptions(entityRef, reducerRef, originalReducers, options);

  for (const [key, reducer] of Object.entries(originalReducers)) {
    reducers[key as keyof TReturnedReducers] = (<TResult>(...restArgs: Parameters<EntityReducer<T>>): unknown => {
      const reducerArgs = (hasInitialEntity ? [entityRef.current, ...restArgs] : restArgs) as Parameters<
        EntityReducer<T>
      >;

      const ret = reducer(...reducerArgs) as TResult;
      const iterator = ret?.[Symbol.iterator as keyof TResult] || ret?.[Symbol.asyncIterator as keyof TResult];

      reducerRef.current = reducer;

      if (!hasInitialEntity) {
        entityRef.current = restArgs[0];
      }

      if (typeof iterator !== 'function') {
        return ret;
      }

      const gen = iterator.call(ret) as TypedEntityGenerator<T, TResult>;

      if (gen !== ret) {
        return ret;
      }

      const values = iterateEntity<T, TResult>(gen, iterateEntityOptions);

      if (values instanceof Promise) {
        return values.then(([newEntity, value]: EntityGeneratorValues<T, TResult>): unknown => {
          return onGenerate(newEntity, value);
        });
      }

      return onGenerate(...values);
    }) as TReturnedReducers[keyof TReturnedReducers];
  }

  return reducers as TReturnedReducers;
};
