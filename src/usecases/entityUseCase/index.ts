import { createEntity } from '@/methods/createEntity';
import { EntityGenerator, EntityReducers, SetEntityCallback, SettableEntity } from '@/types';

export const entityUseCase = <T>(): EntityReducers<T, Record<never, never>> => {
  const setEntity = function* <S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S> {
    let newEntity = settableEntity as S;
    const isFunction = typeof settableEntity === 'function';

    if (isFunction) {
      newEntity = (settableEntity as SetEntityCallback<S>)(entity) as S;
    }

    if (newEntity === entity) {
      return entity;
    }

    const isObject = typeof entity === 'object';

    block: if (isObject) {
      if (entity === null) {
        break block;
      }

      const isArray = Array.isArray(entity);

      if (isArray) {
        break block;
      }

      newEntity = createEntity(entity, newEntity as object) as S;

      if (newEntity === entity) {
        return entity;
      }
    }

    return yield newEntity;
  };

  return {
    setEntity,
  };
};
