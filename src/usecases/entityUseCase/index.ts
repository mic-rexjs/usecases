import { EntityGenerator, EntityReducers, SetEntityCallback, SettableEntity } from '@/types';

export const entityUseCase = <T>(): EntityReducers<T, Record<never, never>> => {
  const setEntity = function* <S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S> {
    const isFunction = typeof settableEntity === 'function';
    const newEntity = isFunction ? (settableEntity as SetEntityCallback<S>)(entity) : settableEntity;

    if (entity === newEntity) {
      return entity;
    }

    return yield newEntity;
  };

  return {
    setEntity,
  };
};
