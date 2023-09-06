import { arrayUseCase } from '.';
import { describe, expect, test } from '@jest/globals';
import { EntityUseCase } from '../types';
import { ArrayReducers } from './types';
import { entityReducerUseCase } from '../entityReducerUseCase';

const { createEntityReducers } = entityReducerUseCase();
const numbersUseCase = arrayUseCase as EntityUseCase<number[], ArrayReducers<number>>;

describe('arrayUseCase', (): void => {
  describe('extractEntity', (): void => {
    test('`extractEntity` should filter elements based on the condition', (): void => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = array.filter((item): boolean => {
        return item > 5;
      });

      expect(result).toEqual([6, 7]);
    });

    test('`extractEntity` should return an empty array when no elements satisfy the condition', (): void => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = array.filter((item): boolean => {
        return item < 0;
      });

      expect(result).toEqual([]);
    });
  });

  describe('fillEntity', (): void => {
    test('`fillEntity` should work with 1 argument', (): void => {
      const { fillEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1] = fillEntity(9);
      const [entity2] = fillEntity(5);

      expect(entity1).toEqual([9, 9, 9]);
      expect(entity2).toEqual([5, 5, 5]);
    });

    test('`fillEntity` should work with 2 arguments', (): void => {
      const { fillEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1] = fillEntity(9, 2);
      const [entity2] = fillEntity(8, 5);
      const [entity3] = fillEntity(7, 1);

      expect(entity1).toEqual([1, 2, 9]);
      expect(entity1).toEqual(entity2);
      expect(entity3).toEqual([1, 7, 7]);
    });

    test('`fillEntity` should work with 3 arguments', (): void => {
      const { fillEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1] = fillEntity(9, 1, 2);
      const [entity2] = fillEntity(8, 5, 10);
      const [entity3] = fillEntity(7, 2, 10);

      expect(entity1).toEqual([1, 9, 3]);
      expect(entity1).toEqual(entity2);
      expect(entity3).toEqual([1, 9, 7]);
    });

    test('`fillEntity` should work with 1+ arguments', (): void => {
      const { fillEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1] = fillEntity(5);
      const [entity2] = fillEntity(6, 2);
      const [entity3] = fillEntity(6, 5);
      const [entity4] = fillEntity(7, 1, 2);
      const [entity5] = fillEntity(7, 3, 5);

      expect(entity1).toEqual([5, 5, 5]);
      expect(entity2).toEqual([5, 5, 6]);
      expect(entity3).toEqual([5, 5, 6]);
      expect(entity2).not.toBe(entity3);
      expect(entity4).toEqual([5, 7, 6]);
      expect(entity5).toEqual([5, 7, 6]);
      expect(entity4).not.toBe(entity5);
    });

    test('`entity` should equal `result` after call `fillEntity` with 1+ arguments', (): void => {
      const { fillEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity, result] = fillEntity(9);

      expect(entity).toBe(result);
    });
  });

  describe('filterEntity', (): void => {
    test('`filterEntity` should work', (): void => {
      const { filterEntity } = createEntityReducers([1, 2, 3], numbersUseCase);

      const [entity1] = filterEntity((value: number): boolean => {
        return value !== 2;
      });

      const [entity2] = filterEntity((value: number): boolean => {
        return value !== 3;
      });

      const [entity3] = filterEntity((value: number): boolean => {
        return value !== 5;
      });

      expect(entity1).toEqual([1, 3]);
      expect(entity2).toEqual([1]);
      expect(entity3).toEqual([1]);
    });

    test('`entity` should equal `result`', (): void => {
      const { filterEntity } = createEntityReducers([1, 2, 3], numbersUseCase);

      const [entity, result] = filterEntity((value: number): boolean => {
        return value !== 2;
      });

      expect(entity).toBe(result);
    });
  });

  describe('popEntity', (): void => {
    test('`popEntity` should work', (): void => {
      const { popEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = popEntity();
      const [entity2, result2] = popEntity();
      const [entity3, result3] = popEntity();
      const [entity4, result4] = popEntity();

      expect(entity1).toEqual([1, 2]);
      expect(result1).toBe(3);

      expect(entity2).toEqual([1]);
      expect(result2).toBe(2);

      expect(entity3).toEqual([]);
      expect(result3).toBe(1);

      expect(entity4).toEqual([]);
      expect(result4).toBe(void 0);
    });
  });

  describe('pushEntity', (): void => {
    test('`pushEntity` should work without any arguments', (): void => {
      const { pushEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity, result] = pushEntity();

      expect(entity).toEqual([1, 2, 3]);
      expect(result).toBe(3);
    });

    test('`pushEntity` should work with 1 argument', (): void => {
      const { pushEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = pushEntity(4);
      const [entity2, result2] = pushEntity(5);

      expect(entity1).toEqual([1, 2, 3, 4]);
      expect(result1).toBe(4);
      expect(entity2).toEqual([1, 2, 3, 4, 5]);
      expect(result2).toBe(5);
    });

    test('`pushEntity` should work with 2+ arguments', (): void => {
      const { pushEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = pushEntity(4, 5, 6, 7);
      const [entity2, result2] = pushEntity(8, 9);

      expect(entity1).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(result1).toBe(7);

      expect(entity2).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result2).toBe(9);
    });

    test('`pushEntity` should work with some arguments', (): void => {
      const { pushEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = pushEntity(4);
      const [entity2, result2] = pushEntity(5, 6);
      const [entity3, result3] = pushEntity();
      const [entity4, result4] = pushEntity(7);

      expect(entity1).toEqual([1, 2, 3, 4]);
      expect(result1).toBe(4);

      expect(entity2).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result2).toBe(6);

      expect(entity3).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result3).toBe(6);

      expect(entity4).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(result4).toBe(7);
    });
  });

  describe('shiftEntity', (): void => {
    test('`shiftEntity` should work without any arguments', (): void => {
      const { shiftEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = shiftEntity();
      const [entity2, result2] = shiftEntity();
      const [entity3, result3] = shiftEntity();
      const [entity4, result4] = shiftEntity();

      expect(entity1).toEqual([2, 3]);
      expect(result1).toBe(1);

      expect(entity2).toEqual([3]);
      expect(result2).toBe(2);

      expect(entity3).toEqual([]);
      expect(result3).toBe(3);

      expect(entity4).toEqual([]);
      expect(result4).toBe(void 0);
    });
  });

  describe('spliceEntity', (): void => {
    test('`spliceEntity` should work with 1 argument', (): void => {
      const { spliceEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = spliceEntity(2);
      const [entity2, result2] = spliceEntity(1);

      expect(entity1).toEqual([1, 2]);
      expect(result1).toEqual([3]);

      expect(entity2).toEqual([1]);
      expect(result2).toEqual([2]);
    });

    test('`spliceEntity` should work with 2 argument', (): void => {
      const { spliceEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = spliceEntity(1, 1);
      const [entity2, result2] = spliceEntity(1, 0);
      const [entity3, result3] = spliceEntity(0, 2);

      expect(entity1).toEqual([1, 3]);
      expect(result1).toEqual([2]);

      expect(entity2).toEqual(entity1);
      expect(result2).toEqual([]);

      expect(entity3).toEqual([]);
      expect(result3).toEqual([1, 3]);
    });

    test('`spliceEntity` should work with 2+ arguments', (): void => {
      const { spliceEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = spliceEntity(1, 1, 4);
      const [entity2, result2] = spliceEntity(1, 0, 5);
      const [entity3, result3] = spliceEntity(1, 100, 6, 7, 8);

      expect(entity1).toEqual([1, 4, 3]);
      expect(result1).toEqual([2]);

      expect(entity2).toEqual([1, 5, 4, 3]);
      expect(result2).toEqual([]);

      expect(entity3).toEqual([1, 6, 7, 8]);
      expect(result3).toEqual([5, 4, 3]);
    });

    test('`spliceEntity` should work with 1+ arguments', (): void => {
      const { spliceEntity } = createEntityReducers([1, 2, 3], numbersUseCase);

      const [entity1, result1] = spliceEntity(1, 100, 6, 7, 8);
      const [entity2, result2] = spliceEntity(3);
      const [entity3, result3] = spliceEntity(0, 1);

      expect(entity1).toEqual([1, 6, 7, 8]);
      expect(result1).toEqual([2, 3]);

      expect(entity2).toEqual([1, 6, 7]);
      expect(result2).toEqual([8]);

      expect(entity3).toEqual([6, 7]);
      expect(result3).toEqual([1]);
    });
  });

  describe('unshiftEntity', (): void => {
    test('`unshiftEntity` should work without any arguments', (): void => {
      const { unshiftEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity, result] = unshiftEntity();

      expect(entity).toEqual([1, 2, 3]);
      expect(result).toBe(3);
    });

    test('`unshiftEntity` should work with 1 argument', (): void => {
      const { unshiftEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = unshiftEntity(4);
      const [entity2, result2] = unshiftEntity(5);

      expect(entity1).toEqual([4, 1, 2, 3]);
      expect(result1).toBe(4);
      expect(entity2).toEqual([5, 4, 1, 2, 3]);
      expect(result2).toBe(5);
    });

    test('`unshiftEntity` should work with 2+ arguments', (): void => {
      const { unshiftEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = unshiftEntity(4, 5, 6, 7);
      const [entity2, result2] = unshiftEntity(8, 9);

      expect(entity1).toEqual([4, 5, 6, 7, 1, 2, 3]);
      expect(result1).toBe(7);

      expect(entity2).toEqual([8, 9, 4, 5, 6, 7, 1, 2, 3]);
      expect(result2).toBe(9);
    });

    test('`unshiftEntity` should work with some arguments', (): void => {
      const { unshiftEntity } = createEntityReducers([1, 2, 3], numbersUseCase);
      const [entity1, result1] = unshiftEntity(4);
      const [entity2, result2] = unshiftEntity(5, 6);
      const [entity3, result3] = unshiftEntity();
      const [entity4, result4] = unshiftEntity(7);

      expect(entity1).toEqual([4, 1, 2, 3]);
      expect(result1).toBe(4);

      expect(entity2).toEqual([5, 6, 4, 1, 2, 3]);
      expect(result2).toBe(6);

      expect(entity3).toEqual([5, 6, 4, 1, 2, 3]);
      expect(result3).toBe(6);

      expect(entity4).toEqual([7, 5, 6, 4, 1, 2, 3]);
      expect(result4).toBe(7);
    });
  });
});
