import { describe, expect, test } from '@jest/globals';
import { entityUseCase } from '.';
import { entityGeneratorUseCase } from '../entityGeneratorUseCase';

describe('entityUseCase', (): void => {
  describe('setEntity', (): void => {
    const { setEntity } = entityUseCase<number>();

    test('`setEntity` should work with a new entity', (): void => {
      const { done } = entityGeneratorUseCase();
      const gen = setEntity(1, 2);
      const [entity, result] = done(gen);

      expect(entity).toBe(2);
      expect(result).toBe(entity);
    });

    test('`setEntity` should work with a set entity callback', (): void => {
      const { done } = entityGeneratorUseCase();

      const gen = setEntity(1, (prevEntity: number): number => {
        return prevEntity + 2;
      });

      const [entity, result] = done(gen);

      expect(entity).toBe(3);
      expect(result).toBe(entity);
    });
  });
});
