import { RefObject } from '@/methods/createRef/types';
import { EntityReducer, EntityReducers } from '@/types';
import { entityGeneratorUseCase } from '@/usecases/entityGeneratorUseCase';
import { EntityGeneratorDoneOptions } from '@/usecases/entityGeneratorUseCase/types';
import { CreateEntityReducersOptions } from '../../types';

export const initDoneOptions = <T, TResult, TReducers extends EntityReducers<T>>(
  entityRef: RefObject<T>,
  reducerRef: RefObject<EntityReducer<T>>,
  originalReducers: TReducers,
  options?: CreateEntityReducersOptions<T, object>
): EntityGeneratorDoneOptions<T, TResult> => {
  const { done } = entityGeneratorUseCase();
  const { setEntity } = originalReducers;
  const { onChange } = options || {};

  return {
    onSync(): T {
      return entityRef.current;
    },
    onYield(nextEntity: T, oldEntity: T): void {
      if (nextEntity === oldEntity) {
        return;
      }

      let newEntity = nextEntity;

      if (reducerRef.current !== setEntity) {
        [newEntity] = done(setEntity(oldEntity, nextEntity));
      }

      entityRef.current = newEntity;
      onChange?.(newEntity, oldEntity);
    },
  };
};
