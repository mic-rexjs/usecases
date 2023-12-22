import { describe, expect, test } from '@jest/globals';
import { runtimeUseCase } from '.';
import { runtimeDataMap } from '@/configs/runtimeDataMap';

describe('runtimeUseCase', (): void => {
  describe('generateId', (): void => {
    test('check id length', (): void => {
      const { generateId } = runtimeUseCase();

      const id1 = generateId();
      const id2 = generateId(8);

      expect(id1.length).toBe(24);
      expect(id2.length).toBe(8);
    });
  });

  describe('setRuntimeData', (): void => {
    test('should set data to the runtime map', (): void => {
      const { setRuntimeData } = runtimeUseCase();
      const key = 'x';
      const value = 123;

      setRuntimeData(key, value);

      expect(runtimeDataMap.get(key)).toBe(value);
    });
  });

  describe('getRuntimeData', (): void => {
    test('should return `undefined` from the runtime map if a key is not exsited', (): void => {
      const { getRuntimeData } = runtimeUseCase();
      const key = 'y';
      const value = getRuntimeData(key);

      expect(typeof value).toBe('undefined');
    });

    test('should get existed data from the runtime map', (): void => {
      const { setRuntimeData, getRuntimeData } = runtimeUseCase();
      const key = 'z';
      const value = 123;

      setRuntimeData(key, value);

      expect(getRuntimeData(key)).toBe(value);
    });
  });
});
