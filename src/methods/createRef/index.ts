import { RefObject } from './types';

export const createRef = <T>(value: T): RefObject<T> => {
  return {
    current: value,
  };
};
