import { EntityGeneratorValues, EntityReducer, EntityReducers, EntityUseCase, TypedEntityGenerator } from '../types';
import { entityGeneratorUseCase } from '../entityGeneratorUseCase';
import { EntityReducerReducers, ScopedEntityReducers, CreateEntityReducersOptions } from './types';

export const entityReducerUseCase = (): EntityReducerReducers => {
  const { done } = entityGeneratorUseCase();

  const createEntityReducers = <
    T,
    TReducers extends EntityReducers<T>,
    TUseCaseOptions extends object,
    TScopedEntityReducers = ScopedEntityReducers<T, TReducers>
  >(
    defaultEntity: T,
    usecase: EntityUseCase<T, TReducers, TUseCaseOptions>,
    options?: CreateEntityReducersOptions<T, TUseCaseOptions>
  ): TScopedEntityReducers => {
    let entity = defaultEntity;
    const reducers: Partial<TScopedEntityReducers> = {};

    const {
      onChange,
      onGenerate = <TResult>(newEntity: T, result: TResult): EntityGeneratorValues<T, TResult> => {
        return [newEntity, result];
      },
      ...usecaseOptions
    } = options || {};

    const originalReducers = usecase(usecaseOptions as TUseCaseOptions);
    const { setEntity } = originalReducers;

    Object.entries(originalReducers).forEach(([key, reducer]: [string, EntityReducer<T>]): void => {
      reducers[key as keyof TScopedEntityReducers] = (<TArgs extends never[], TResult>(...rest: TArgs): unknown => {
        const ret = reducer(entity, ...rest) as TResult;
        const iterator = ret?.[Symbol.iterator as keyof TResult] || ret?.[Symbol.asyncIterator as keyof TResult];

        if (typeof iterator !== 'function') {
          return ret;
        }

        const gen = iterator.call(ret) as TypedEntityGenerator<T, TResult>;

        if (gen !== ret) {
          return ret;
        }

        const values = done(gen, {
          onSync(): T {
            return entity;
          },
          onYield(yieldedEntity: T): void {
            const prevEntity = entity;

            if (yieldedEntity === entity) {
              return;
            }

            let newEntity = yieldedEntity;

            if (reducer !== setEntity) {
              [newEntity] = done(setEntity(entity, yieldedEntity));
            }

            entity = newEntity;
            onChange?.(newEntity, prevEntity);
          },
        });

        if (values instanceof Promise) {
          return values.then(([newEntity, value]: EntityGeneratorValues<T, TResult>): unknown => {
            return onGenerate(newEntity, value);
          });
        }

        return onGenerate(...values);
      }) as TScopedEntityReducers[keyof TScopedEntityReducers];
    });

    return reducers as TScopedEntityReducers;
  };

  return {
    createEntityReducers,
  };
};
