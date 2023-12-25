import { RefObject } from '@/methods/createRef/types';
import { EntityReducer, EntityReducerMap } from '@/types';
import { CreateEntityReducersOptions } from '../createEntityReducers/types';
import { iterateEntity } from '../iterateEntity';
import { IterateEntityOptions } from '../iterateEntity/types';

export const initIterateEntityOptions = <T, TEntityReducers extends EntityReducerMap<T>, TResult>(
  entityRef: RefObject<T>,
  reducerRef: RefObject<EntityReducer<T>>,
  originalReducers: TEntityReducers,
  options?: CreateEntityReducersOptions<T, object>
): IterateEntityOptions<T, TResult> => {
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
        [newEntity] = iterateEntity(setEntity(oldEntity, nextEntity));
      }

      entityRef.current = newEntity;
      onChange?.(newEntity, oldEntity);
    },
  };
};
