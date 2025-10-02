import { AccessorDescriptors } from '../../types';

export const compareObject = <T extends object>(
  object1: T,
  object2: T,
  accessorDescriptors: AccessorDescriptors<T> | null,
): boolean => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  const { length: length1 } = keys1;
  const { length: length2 } = keys2;

  if (length1 !== length2) {
    return false;
  }

  const accessorKeys = Object.keys(accessorDescriptors || {});

  for (const key of keys1) {
    if (accessorKeys.includes(key)) {
      continue;
    }

    const value1 = object1[key as keyof T];
    const value2 = object2[key as keyof T];

    if (value1 === value2) {
      continue;
    }

    return false;
  }

  return true;
};
