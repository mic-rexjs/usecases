import { EntityGenerator } from '../types';
import { entityUseCase } from '../entityUseCase';
import { ObjectReducers, SettableObjectEntity } from './types';

export const objectUseCase = <T extends object>(): ObjectReducers<T> => {
  const { setEntity: setEntityWithCallback } = entityUseCase<T>();

  const setEntity = function* (entity: T, settableEntity: SettableObjectEntity<T>): EntityGenerator<T, T> {
    if (typeof settableEntity === 'function') {
      return yield* setEntityWithCallback(entity, settableEntity);
    }

    if (entity === settableEntity) {
      return entity;
    }

    return yield {
      ...entity,
      ...settableEntity,
    };
  };

  return {
    setEntity,
  };
};
