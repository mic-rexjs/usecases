import { AccessorDescriptors } from '../../types';

export const getAccessorDescriptorMap = <T extends object>(object: T): AccessorDescriptors<T> => {
  const descriptors: AccessorDescriptors<T> = {};
  const allDescriptors = Object.getOwnPropertyDescriptors(object);

  for (const key of Object.keys(allDescriptors)) {
    const { set, ...descriptor } = allDescriptors[key];
    const { get } = descriptor;

    if (typeof get !== 'function') {
      continue;
    }

    descriptors[key as keyof T] = descriptor;
  }

  return descriptors;
};
