import { describe, expect, test } from '@jest/globals';
import { entityUseCase } from '.';
import { iterateEntity } from '@/methods/iterateEntity';

describe('entityUseCase', (): void => {
  describe('setEntity', (): void => {
    const { setEntity } = entityUseCase<number>();

    test('`setEntity` should work with a new entity', (): void => {
      const gen = setEntity(1, 2);
      const [entity, result] = iterateEntity(gen);

      expect(entity).toBe(2);
      expect(result).toBe(entity);
    });

    test('`setEntity` should work with a set entity callback', (): void => {
      const gen = setEntity(1, (entity: number): number => {
        return entity + 2;
      });

      const [entity, result] = iterateEntity(gen);

      expect(entity).toBe(3);
      expect(result).toBe(entity);
    });
  });
});
