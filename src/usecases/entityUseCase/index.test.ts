import { describe, expect, test } from '@jest/globals';
import { entityUseCase } from '.';
import { createEntityReducers } from '@/methods/createEntityReducers';

describe('entityUseCase', (): void => {
  describe('setEntity', (): void => {
    const { setEntity } = createEntityReducers(entityUseCase<number>);

    test('`setEntity` should work with a new entity', (): void => {
      const [entity, result] = setEntity(1, 2);

      expect(entity).toBe(2);
      expect(result).toBe(entity);
    });

    test('`setEntity` should work with a set entity callback', (): void => {
      const [entity, result] = setEntity(1, (curentEntity: number): number => {
        return curentEntity + 2;
      });

      expect(entity).toBe(3);
      expect(result).toBe(entity);
    });
  });
});
