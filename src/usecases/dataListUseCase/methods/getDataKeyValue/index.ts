import { _IdOwner, Data, ExtractDataKeyValue, IdOwner, KeyOwner } from '../../types';

export const getDataKeyValue = <T extends Data>(data: Data): ExtractDataKeyValue<T> => {
  if (Object.hasOwn(data, 'id')) {
    const { id } = data as IdOwner;

    return id as ExtractDataKeyValue<T>;
  }

  if (Object.hasOwn(data, '_id')) {
    const { _id } = data as _IdOwner;

    return _id as ExtractDataKeyValue<T>;
  }

  const { key } = data as KeyOwner;

  return key as ExtractDataKeyValue<T>;
};
