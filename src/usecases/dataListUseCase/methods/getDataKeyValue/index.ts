import { _IdOwner, Data, DataKeyValue, IdOwner, KeyOwner } from '../../types';

export const getDataKeyValue = (data: Data): DataKeyValue => {
  if (Object.hasOwn(data, 'id')) {
    const { id } = data as IdOwner;

    return id;
  }

  if (Object.hasOwn(data, '_id')) {
    const { _id } = data as _IdOwner;

    return _id;
  }

  const { key } = data as KeyOwner;

  return key;
};
