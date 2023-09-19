import { EntityGeneratorValues, EntityReducer, EntityReducers, EntityUseCase, TypedEntityGenerator } from '@/types';
import { entityGeneratorUseCase } from '../entityGeneratorUseCase';
import {
  EntityReducerReducers,
  ScopedEntityReducers,
  CreateEntityReducersOptions,
  SmoothedEntityReducers,
  EntityReducersCreator,
} from './types';
import { initOptions } from './methods/initOptions';
import { createRef } from '@/methods/createRef';
import { initDoneOptions } from './methods/initDoneOptions';

export const entityReducerUseCase = (): EntityReducerReducers => {
  const { done } = entityGeneratorUseCase();

  const createEntityReducers: EntityReducersCreator = <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object,
    TUseCase extends EntityUseCase<T, TReducers, TUseCaseOptions>,
    TReturnedReducers extends SmoothedEntityReducers<T, TReducers> | ScopedEntityReducers<T, TReducers>
  >(
    arg1: T | TUseCase,
    arg2?: TUseCase | CreateEntityReducersOptions<T, TUseCaseOptions>,
    arg3?: CreateEntityReducersOptions<T, TUseCaseOptions>
  ): TReturnedReducers => {
    const hasDefaultEntity = typeof arg2 === 'function';
    const defaultEntity = (hasDefaultEntity ? arg1 : null) as T;
    const usecase = (hasDefaultEntity ? arg2 : arg1) as EntityUseCase<T, TReducers, TUseCaseOptions>;
    const options = (hasDefaultEntity ? arg3 : arg2) as CreateEntityReducersOptions<T, TUseCaseOptions>;
    const { onChange, onGenerate, ...usecaseOptions } = initOptions(options);
    const reducers: Partial<TReturnedReducers> = {};
    const originalReducers = usecase(usecaseOptions as TUseCaseOptions);
    const { setEntity } = originalReducers;
    const entityRef = createRef(defaultEntity);
    const reducerRef = createRef<EntityReducer<T>>(setEntity);
    const doneOptions = initDoneOptions(entityRef, reducerRef, originalReducers, options);

    for (const [key, reducer] of Object.entries(originalReducers)) {
      reducers[key as keyof TReturnedReducers] = (<TResult>(...restArgs: Parameters<EntityReducer<T>>): unknown => {
        const reducerArgs = (hasDefaultEntity ? [entityRef.current, ...restArgs] : restArgs) as Parameters<
          EntityReducer<T>
        >;

        const ret = reducer(...reducerArgs) as TResult;
        const iterator = ret?.[Symbol.iterator as keyof TResult] || ret?.[Symbol.asyncIterator as keyof TResult];

        reducerRef.current = reducer;

        if (!hasDefaultEntity) {
          entityRef.current = restArgs[0];
        }

        if (typeof iterator !== 'function') {
          return ret;
        }

        const gen = iterator.call(ret) as TypedEntityGenerator<T, TResult>;

        if (gen !== ret) {
          return ret;
        }

        const values = done<T, TResult>(gen, doneOptions);

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

  return {
    createEntityReducers,
  };
};
