import { EntityGenerator, EntityReducers, SetEntityCallback, SettableEntity } from '../types';

export const entityUseCase = <T>(): EntityReducers<T, Record<never, never>> => {
  const setEntity = function* (entity: T, settableEntity: SettableEntity<T>): EntityGenerator<T, T> {
    const isFunction = typeof settableEntity === 'function';
    const newEntity = isFunction ? (settableEntity as SetEntityCallback<T>)(entity) : settableEntity;

    if (entity === newEntity) {
      return entity;
    }

    return yield newEntity;
  };

  return {
    setEntity,
  };
};
