import { EntityGenerator } from '@/types';
import { entityUseCase } from '../entityUseCase';
import { AccessorDescriptors, ObjectReducers, SettableObjectEntity } from './types';
import { getAccessorDescriptorMap } from './methods/getAccessorDescriptorMap';

export const objectUseCase = <T extends object>(): ObjectReducers<T> => {
  let hasAccessors = false;
  let accessorDescriptors: AccessorDescriptors<T> | null = null;
  const entityReducers = entityUseCase<T>();

  const setEntity = function* <S extends T>(entity: S, settableEntity: SettableObjectEntity<S>): EntityGenerator<S, S> {
    let newEntity: S;

    if (typeof settableEntity === 'function') {
      newEntity = settableEntity(entity);

      if (entity === newEntity) {
        return newEntity;
      }
    } else {
      newEntity = {
        ...entity,
        ...settableEntity,
      };
    }

    if (accessorDescriptors === null) {
      accessorDescriptors = getAccessorDescriptorMap(entity);
      hasAccessors = Object.keys(accessorDescriptors).length > 0;
    }

    if (hasAccessors) {
      Object.defineProperties(newEntity, accessorDescriptors as PropertyDescriptorMap);
    }

    return yield newEntity;
  };

  return {
    ...entityReducers,
    setEntity,
  };
};
