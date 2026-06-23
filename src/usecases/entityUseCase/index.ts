import { EntityGenerator, EntityReducers, SettableEntity } from '@/types';

export const entityUseCase = <T>(): EntityReducers<T, Record<never, never>> => {
  const setEntity = function* <S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S> {
    const isFunction = typeof settableEntity === 'function';

    if (!isFunction) {
      return yield settableEntity;
    }

    return yield settableEntity(entity);
  };

  return {
    setEntity,
  };
};
