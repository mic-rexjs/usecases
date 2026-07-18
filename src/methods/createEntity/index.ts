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

      const newDescriptor = Object.getOwnPropertyDescriptor(entityItem, key) as PropertyDescriptor;
      const { value: newValue, get: newGetter, set: newSetter } = newDescriptor;
      const isUndefinedValue = typeof newValue === 'undefined';
      const hasGet = typeof newGetter === 'function';
      const hasSet = typeof newSetter === 'function';
      const isAccessor = hasGet || hasSet;
      const isUndefined = isUndefinedValue && !isAccessor;

      // 如果是 `undefined`
      if (isUndefined) {
        continue;
      }

      if (descriptor === null) {
        isChanged = true;
        descriptors[key as keyof T] = newDescriptor;
        continue;
      }

      const { value } = descriptor;

      /**
       * 这里不能直接使用 `newValue`，
       * 如果是访问器， 那么 `newValue` 一定是 `undefined`，
       * 而且访问器属性也不能覆盖普通值属性。
       */
      const targetValue = entityItem[key as keyof T];

      // 如果和原属性值一样
      if (value === targetValue) {
        continue;
      }

      isChanged = true;

      descriptors[key as keyof T] = {
        ...descriptor,
        value: targetValue,
      };
    }
  }

  if (!isChanged) {
    return entity as T;
  }

  return Object.defineProperties({}, descriptors) as T;
};
