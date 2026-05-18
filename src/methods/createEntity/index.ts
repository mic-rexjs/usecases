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
    const descriptors = Object.getOwnPropertyDescriptors(currentEntity);
    const filteredDescriptors: Record<string, PropertyDescriptor> = {};
    const keys = Object.keys(descriptors);

    for (const key of keys) {
      const descriptor = descriptors[key];
      const { value, get, set } = descriptor;
      const isUndefinedValue = typeof value === 'undefined';
      const hasGet = typeof get === 'function';
      const hasSet = typeof set === 'function';
      const hasAccessor = hasGet || hasSet;
      const isUndefined = isUndefinedValue && !hasAccessor;

      if (isUndefined) {
        continue;
      }

      filteredDescriptors[key] = descriptor;
    }

    Object.defineProperties(newEntity, filteredDescriptors);
  }

  return newEntity as T;
};
