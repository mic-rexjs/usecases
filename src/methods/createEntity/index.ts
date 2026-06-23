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
  const baseDescriptors = Object.getOwnPropertyDescriptors(entity);
  const newEntity: Partial<T> = Object.defineProperties({}, baseDescriptors);

  for (const entityItem of restEntities) {
    const keys = Reflect.ownKeys(entityItem);

    for (const key of keys) {
      const baseDescriptor = baseDescriptors[key as keyof T] || {};
      const { get: basePropertyGetter, set: basePropertySetter } = baseDescriptor;

      // 如果原属性是访问器
      if (basePropertyGetter || basePropertySetter) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(entityItem, key) as PropertyDescriptor;
      const { value, get, set } = descriptor;
      const isUndefinedValue = typeof value === 'undefined';
      const hasGet = typeof get === 'function';
      const hasSet = typeof set === 'function';
      const hasAccessor = hasGet || hasSet;
      const isUndefined = isUndefinedValue && !hasAccessor;

      // 如果是 `undefined`
      if (isUndefined) {
        continue;
      }

      const { value: basePropertyValue } = baseDescriptor;

      // 如果和原属性值一样
      if (basePropertyValue === value) {
        continue;
      }

      isChanged = true;
      Object.defineProperty(newEntity, key, descriptor);
    }
  }

  return (isChanged ? newEntity : entity) as T;
};
