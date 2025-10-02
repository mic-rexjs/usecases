import { EntityGenerator } from '@/types';
import { entityUseCase } from '../entityUseCase';
import { AccessorDescriptors, ObjectReducers, SettableObjectEntity } from './types';
import { getAccessorDescriptorMap } from './methods/getAccessorDescriptorMap';
import { compareObject } from './methods/compareObject';

export const objectUseCase = <T extends object>(): ObjectReducers<T> => {
  let hasAccessors = false;
  let accessorDescriptors: AccessorDescriptors<T> | null = null;
  const entityReducers = entityUseCase<T>();

  const setEntity = function* <S extends T>(entity: S, settableEntity: SettableObjectEntity<S>): EntityGenerator<S, S> {
    let newEntity: S;

    if (typeof settableEntity !== 'function') {
      // 不使用 `{...entity, ...settableEntity}`，是因为避免调用 `getter`
      newEntity = Object.defineProperties(
        {},
        {
          ...Object.getOwnPropertyDescriptors(entity),
          ...Object.getOwnPropertyDescriptors(settableEntity),
        },
      ) as S;
    } else {
      newEntity = settableEntity(entity);

      if (entity === newEntity) {
        return newEntity;
      }
    }

    if (accessorDescriptors === null) {
      accessorDescriptors = getAccessorDescriptorMap(entity);
      hasAccessors = Object.keys(accessorDescriptors).length > 0;
    }

    if (hasAccessors) {
      Object.defineProperties(newEntity, accessorDescriptors as PropertyDescriptorMap);
    }

    if (compareObject(entity, newEntity, accessorDescriptors)) {
      return entity;
    }

    return yield newEntity;
  };

  return {
    ...entityReducers,
    setEntity,
  };
};
