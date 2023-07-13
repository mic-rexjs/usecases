import { describe, expect, test } from '@jest/globals';
import { entityReducerUseCase } from '../entityReducerUseCase';
import { objectUseCase } from '.';
import { EntityUseCase } from '../types';
import { ObjectReducers } from './types';

interface Data {
  key: string;

  value: number;
}

const { createEntityReducers } = entityReducerUseCase();
const dataUseCase = objectUseCase as EntityUseCase<Data, ObjectReducers<Data>>;

describe('objectUseCase', (): void => {
  describe('setEntity', (): void => {
    test('`setEntity` shuold work with a new entity', (): void => {
      const { setEntity } = createEntityReducers({ key: 'x', value: 1 }, dataUseCase);

      const [entity1, result1] = setEntity({ key: 'y', value: 2 });
      const [entity2, result2] = setEntity({ value: 3 });

      expect(entity1).toEqual({ key: 'y', value: 2 });
      expect(result1).toBe(entity1);
      expect(entity2).toEqual({ key: 'y', value: 3 });
      expect(result2).toBe(entity2);
    });

    test('`setEntity` should work with a set entity callback', (): void => {
      const { setEntity } = createEntityReducers({ key: 'x', value: 1 }, dataUseCase);

      const [entity1, result1] = setEntity((): Data => {
        return { key: 'y', value: 2 };
      });

      const [entity2, result2] = setEntity(({ value }: Data): Data => {
        return { key: 'y', value: value + 3 };
      });

      expect(entity1).toEqual({ key: 'y', value: 2 });
      expect(result1).toBe(result1);
      expect(entity2).toEqual({ key: 'y', value: 5 });
      expect(result2).toBe(entity2);
    });
  });
});
