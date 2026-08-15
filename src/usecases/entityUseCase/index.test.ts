import { entityUseCase } from '.';
import { describe, expect, jest, test } from '@jest/globals';
import { createEntityReducers } from '@/methods/createEntityReducers';
import { EntityGenerator, EntityReducers, SettableEntity } from '@/types';

interface Data {
  key: string;

  value: number;
}

type DataReducers<T extends Data> = EntityReducers<
  T,
  {
    addValue<S extends T>(entity: S, value: number): EntityGenerator<S, number>;
  }
>;

const dataUseCase = <T extends Data>(): DataReducers<T> => {
  const entityReducers = entityUseCase<T>();

  const addValue = function* <S extends T>(entity: S, value: number): EntityGenerator<S, number> {
    const newEntity1 = yield {
      value: entity.value + value,
    } as S;

    const newEntity3 = yield {
      ...newEntity1,
      value: newEntity1.value + value,
    };

    return newEntity3.value + 10;
  };

  return {
    ...entityReducers,
    addValue,
  };
};

describe('entityUseCase', (): void => {
  describe('non-object entity', (): void => {
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

  describe('object entity', (): void => {
    test('`setEntity` shuold work with a new entity', (): void => {
      const { setEntity } = createEntityReducers({ key: 'x', value: 1 }, dataUseCase);

      const [entity1, result1] = setEntity({ key: 'y', value: 2 });
      const [entity2, result2] = setEntity({ value: 3 });

      expect(entity1).toEqual({ key: 'y', value: 2 });
      expect(result1).toBe(entity1);
      expect(entity2).toEqual({ key: 'y', value: 3 });
      expect(result2).toBe(entity2);
    });

    test('`setEntity` shuold work with entity which has accessors', (): void => {
      const { setEntity } = createEntityReducers(
        {
          get key(): string {
            return 'x';
          },
          value: 1,
        },
        dataUseCase,
      );

      const [entity1, result1] = setEntity({ key: 'y', value: 2 });
      const [entity2, result2] = setEntity({ value: 3 });

      expect(entity1).toEqual({ key: 'x', value: 2 });
      expect(result1).toBe(entity1);
      expect(entity2).toEqual({ key: 'x', value: 3 });
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

    test('The `onYield` event should work correctly when using `setEntity`', (): void => {
      const defaultEntity = {
        get key(): string {
          return this.value + '_xyz';
        },
        value: 1,
      };

      const onYield = jest.fn((value: Data): Data => {
        return value;
      });

      const { setEntity } = createEntityReducers(defaultEntity, dataUseCase, {
        onYield,
      });

      const [entity1, result1] = setEntity({ value: 1 });

      expect(entity1).toBe(defaultEntity);
      expect(result1).toBe(defaultEntity);
      expect(onYield).toHaveBeenCalledTimes(1);

      const [entity2, result2] = setEntity({ value: 2 });

      expect(entity2).toEqual({ key: '2_xyz', value: 2 });
      expect(result2).toEqual({ key: '2_xyz', value: 2 });
      expect(onYield).toHaveBeenCalledTimes(2);
    });

    test('yield entity should work', (): void => {
      const onYield = jest.fn(<T extends Data>(newEntity: T, oldEntity: T): T => {
        void oldEntity;

        return newEntity;
      });

      const { addValue } = createEntityReducers({ key: 'x', value: 1 }, dataUseCase, { onYield });

      addValue(5);
      expect(onYield).toHaveBeenCalledWith({ key: 'x', value: 6 }, { key: 'x', value: 1 });

      addValue(5);
      expect(onYield).toHaveBeenCalledWith({ key: 'x', value: 11 }, { key: 'x', value: 6 });
    });
  });

  describe('sub usecase', (): void => {
    const subDataUseCase = <T extends Data>(): DataReducers<T> => {
      const dataReducers = dataUseCase<T>();
      const { setEntity: setDataEntity, addValue } = dataReducers;

      const setEntity = function* <S extends T>(entity: S, settableEntity: SettableEntity<S>): EntityGenerator<S, S> {
        const newEntity = yield* setDataEntity(entity, settableEntity);

        yield* addValue(newEntity, 10);

        return yield (currentEntity: S): S => {
          return currentEntity;
        };
      };

      return {
        ...dataReducers,
        addValue,
        setEntity,
      };
    };

    test('`setEntity` should work after overrode', (): void => {
      const onYield = jest.fn(<T extends Data>(newEntity: T, oldEntity: T): T => {
        void oldEntity;

        return newEntity;
      });

      const { setEntity } = createEntityReducers(
        {
          get key(): string {
            return `${this.value}_xyz`;
          },
          value: 1,
        },
        subDataUseCase,
        { onYield },
      );

      const [newEntity, newResult] = setEntity({ value: 100 });
      const { get } = Object.getOwnPropertyDescriptor(newEntity, 'key') as PropertyDescriptor;

      expect(onYield).toHaveBeenCalledTimes(4);

      expect(newEntity).toEqual({
        key: `120_xyz`,
        value: 120,
      });

      expect(newResult).toEqual({
        key: `120_xyz`,
        value: 120,
      });

      expect(typeof get).toEqual('function');
    });
  });
});
