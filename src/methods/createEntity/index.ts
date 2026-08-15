import { CreateEntity, CreateEntityFactory } from './types';

export const createEntity: CreateEntity = <T>(
  entity: CreateEntityFactory<T> | Partial<T>,
  ...restEntities: Partial<T>[]
): T => {
  if (typeof entity === 'function') {
    return entity();
  }

  const isObject = typeof entity === 'object';
  const isNull = entity === null;
  const isArray = Array.isArray(entity);

  if (!isObject || isNull || isArray) {
    const { length } = restEntities;

    if (length > 0) {
      return restEntities[length - 1] as T;
    }

    return entity as T;
  }

  let isChanged = false;
  const descriptors = Object.getOwnPropertyDescriptors(entity) as Record<keyof T, PropertyDescriptor>;

  for (const entityItem of restEntities) {
    const keys = Reflect.ownKeys(entityItem);

    for (const key of keys) {
      const descriptor = descriptors[key as keyof T] || null;
      const { get: getter, set: setter } = descriptor || {};

      // 如果原属性是访问器，那么不能被覆盖
      if (getter || setter) {
        continue;
      }

      const itemDescriptor = Object.getOwnPropertyDescriptor(entityItem, key) as PropertyDescriptor;

      if (descriptor !== null) {
        const { value } = descriptor;
        const { value: itemValue, set: itemSetter, get: itemGetter } = itemDescriptor;

        if (itemSetter || itemGetter) {
          continue;
        }

        // 如果和原属性值一样
        if (value === itemValue) {
          continue;
        }
      }

      isChanged = true;
      descriptors[key as keyof T] = itemDescriptor;
    }
  }

  if (!isChanged) {
    return entity as T;
  }

  return Object.defineProperties({}, descriptors) as T;
};
