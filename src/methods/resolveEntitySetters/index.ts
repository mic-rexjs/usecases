import { EntitySetter } from './types';

export const resolveEntitySetters = <T>(entity: T): T => {
  const isObject = typeof entity === 'object';
  const isNull = entity === null;
  const isArray = Array.isArray(entity);

  if (!isObject || isNull || isArray) {
    return entity;
  }

  let hasSetter = false;
  const descriptors = Object.getOwnPropertyDescriptors(entity) as Record<keyof T, PropertyDescriptor>;

  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor = descriptors[key as keyof T];
    const { get: getter, set: setter, ...restDescriptor } = descriptor;

    if (typeof setter !== 'function') {
      continue;
    }

    hasSetter = true;

    if (typeof getter === 'function') {
      // 如果有 `getter`， 那么就忽略 `setter`，因为 `setter` 是用来初始化属性用的
      descriptors[key as keyof T] = {
        ...restDescriptor,
        get: getter,
      };

      continue;
    }

    const partialEntity: Partial<T> = {};

    (setter as EntitySetter<T>).apply(partialEntity as T);

    descriptors[key as keyof T] = {
      ...restDescriptor,
      value: partialEntity[key as keyof T],
    };
  }

  if (hasSetter) {
    return Object.defineProperties({}, descriptors) as T;
  }

  return entity;
};
