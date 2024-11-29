import { describe, expect, test } from '@jest/globals';
import { objectUseCase } from '.';
import { EntityUseCase } from '@/types';
import { ObjectReducers } from './types';
import { createEntityReducers } from '@/methods/createEntityReducers';

interface Data {
  key: string;

  value: number;
}

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
      expect(result1).toBe(entity1);
      expect(entity2).toEqual({ key: 'y', value: 5 });
      expect(result2).toBe(entity2);
    });

    test('`setEntity` should work with some accessors of an object', (): void => {
      const { setEntity } = createEntityReducers(
        {
          get key(): string {
            return this.value + '_xyz';
          },
          value: 1,
        },
        dataUseCase,
      );

      const [entity1, result1] = setEntity((): Data => {
        return { key: 'y', value: 2 };
      });

      const [entity2, result2] = setEntity(({ value }: Data): Data => {
        return { key: 'hello', value: value + 3 };
      });

      const [entity3, result3] = setEntity({ value: 10 });

      expect(entity1).toEqual({ key: '2_xyz', value: 2 });
      expect(result1).toBe(entity1);
      expect(entity2).toEqual({ key: '5_xyz', value: 5 });
      expect(result2).toBe(entity2);
      expect(entity3).toEqual({ key: '10_xyz', value: 10 });
      expect(result3).toBe(entity3);
    });
  });
});
