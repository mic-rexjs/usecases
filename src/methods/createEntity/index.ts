import { CreateEntity, CreateEntityFactory } from './types';

export const createEntity: CreateEntity = <T>(
  entity: CreateEntityFactory<T> | Partial<T>,
  ...restEntities: Partial<T>[]
): T => {
  if (typeof entity === 'function') {
    return entity();
  }

  const newEntity: Partial<T> = Object.defineProperties({}, Object.getOwnPropertyDescriptors(entity));

  for (const currentEntity of restEntities) {
    Object.defineProperties(newEntity, Object.getOwnPropertyDescriptors(currentEntity));
  }

  return newEntity as T;
};
