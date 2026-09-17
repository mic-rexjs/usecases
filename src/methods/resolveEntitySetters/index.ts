import { EntitySetter } from './types';

export const resolveEntitySetters = <T>(entity: T): T => {
  const isObject = typeof entity === 'object';
  const isNull = entity === null;
  const isArray = Array.isArray(entity);

  if (!isObject || isNull || isArray) {
    return entity;
  }

  const setterKeys: PropertyKey[] = [];
  const descriptors = Object.getOwnPropertyDescriptors(entity) as Record<keyof T, PropertyDescriptor>;
  const newDescriptors = {} as Record<keyof T, PropertyDescriptor>;

  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor = descriptors[key as keyof T];
    const { get: getter, set: setter, ...restDescriptor } = descriptor;

    if (typeof setter !== 'function') {
      newDescriptors[key as keyof T] = descriptor;
      continue;
    }

    if (typeof getter === 'function') {
      // 如果有 `getter`， 那么就忽略 `setter`，因为 `setter` 是用来初始化属性用的
      newDescriptors[key as keyof T] = {
        ...restDescriptor,
        get: getter,
      };

      continue;
    }

    setterKeys.push(key);
  }

  const { length } = setterKeys;

  if (length === 0) {
    return entity;
  }

  const newEntity = Object.defineProperties({}, newDescriptors) as T;

  for (const key of setterKeys) {
    const { set } = descriptors[key as keyof T];

    (set as EntitySetter<T>).apply(newEntity);
  }

  return newEntity;
};
