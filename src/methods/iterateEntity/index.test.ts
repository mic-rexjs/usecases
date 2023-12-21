import { describe, test, expect, jest } from '@jest/globals';
import { AsyncEntityGenerator, EntityGenerator } from '@/types';
import { iterateEntity } from '.';

const reducer = function* (): EntityGenerator<number, string> {
  const newEntity1 = yield 1;
  const newEntity2 = yield newEntity1 + 1;

  return 'xyz' + newEntity2;
};

const reducerAsync = async function* (): AsyncEntityGenerator<number, string> {
  await Promise.resolve(null);
  const newEntity1 = yield 1;
  await Promise.resolve(null);
  const newEntity2 = yield newEntity1 + 1;

  return 'xyz' + newEntity2;
};

const reducerWithYieldFn = function* (entity: number): EntityGenerator<number, number> {
  yield (currentEntity = entity): number => {
    return currentEntity + 10;
  };

  const newEntity = yield (currentEntity = 1): number => {
    return currentEntity + 100;
  };

  return yield newEntity + 1000;
};

const reducerWithYieldFnAsync = async function* (entity: number): AsyncEntityGenerator<number, number> {
  await Promise.resolve(null);

  yield (currentEntity = entity): number => {
    return currentEntity + 10;
  };

  await Promise.resolve(null);

  const newEntity = yield (currentEntity: number): number => {
    return currentEntity + 100;
  };

  return yield newEntity + 1000;
};

const reducerWithYieldIterator = function* (entity: number): EntityGenerator<number, number> {
  const value = yield* reducerWithYieldFn(entity + 50);

  return value + 500;
};

describe('iterateEntity', (): void => {
  describe('values', (): void => {
    test('`values` type should be `array` with sync mode', (): void => {
      const gen = reducer();
      const values = iterateEntity(gen);

      expect(Array.isArray(values)).toBe(true);
    });

    test('`values` type should be `array` with async mode', (): void => {
      const gen = reducerAsync();
      const promise = iterateEntity(gen);

      expect(promise instanceof Promise).toBe(true);
    });
  });

  describe('values.length', (): void => {
    test('`values.length` should be `2` with sync mode', (): void => {
      const gen = reducer();
      const values = iterateEntity(gen);

      expect(values).toHaveLength(2);
    });

    test('`values.length` should be `2` with async mode', async (): Promise<void> => {
      const gen = reducerAsync();
      const values = await iterateEntity(gen);

      expect(values).toHaveLength(2);
    });
  });

  describe('entity', (): void => {
    test('check `entity` with sync mode', (): void => {
      const gen = reducer();
      const [entity] = iterateEntity(gen);

      expect(entity).toBe(2);
    });

    test('check `entity` with async mode', async (): Promise<void> => {
      const gen = reducerAsync();
      const [entity] = await iterateEntity(gen);

      expect(entity).toBe(2);
    });

    test('check `entity` after yield entity callbacks with sync mode', (): void => {
      const gen = reducerWithYieldFn(1);
      const [entity] = iterateEntity(gen);

      expect(entity).toBe(1111);
    });

    test('check `entity` after yield entity callbacks with async mode', async (): Promise<void> => {
      const gen = reducerWithYieldFnAsync(1);
      const [entity] = await iterateEntity(gen);

      expect(entity).toBe(1111);
    });

    test('check `entity` with yield* mode', (): void => {
      const gen = reducerWithYieldIterator(1);
      const [entity] = iterateEntity(gen);

      expect(entity).toBe(1161);
    });
  });

  describe('result', (): void => {
    test('check `result` with sync mode', (): void => {
      const gen = reducer();
      const [, result] = iterateEntity(gen);

      expect(result).toBe('xyz2');
    });

    test('check `result` with async mode', async (): Promise<void> => {
      const gen = reducerAsync();
      const [, result] = await iterateEntity(gen);

      expect(result).toBe('xyz2');
    });

    test('check `result` after yield entity callbacks with sync mode', (): void => {
      const gen = reducerWithYieldFn(1);
      const [entity, result] = iterateEntity(gen);

      expect(result).toBe(entity);
    });

    test('check `result` after yield async entity callbacks with async mode', async (): Promise<void> => {
      const gen = reducerWithYieldFnAsync(1);
      const [entity, result] = await iterateEntity(gen);

      expect(result).toBe(entity);
    });

    test('check `result` with yield* mode', (): void => {
      const gen = reducerWithYieldIterator(1);
      const [, result] = iterateEntity(gen);

      expect(result).toBe(1661);
    });
  });

  describe('options.onYield', (): void => {
    test('`options.onYield` should work with sync mode', (): void => {
      const onYield = jest.fn((): void => {});

      const gen = reducerWithYieldFn(1);
      const [entity, result] = iterateEntity(gen, { onYield });

      expect(entity).toBe(1111);
      expect(entity).toBe(result);
      expect(onYield).toHaveBeenCalledTimes(3);
      expect(onYield).toHaveBeenNthCalledWith(1, 11, void 0);
      expect(onYield).toHaveBeenNthCalledWith(2, 111, 11);
      expect(onYield).toHaveBeenNthCalledWith(3, 1111, 111);
    });

    test('`options.onYield` should work with async mode', async (): Promise<void> => {
      const onYield = jest.fn((): void => {});

      const gen = reducerWithYieldFnAsync(1);
      const [entity, result] = await iterateEntity(gen, { onYield });

      expect(entity).toBe(1111);
      expect(entity).toBe(result);
      expect(onYield).toHaveBeenCalledTimes(3);
      expect(onYield).toHaveBeenNthCalledWith(1, 11, void 0);
      expect(onYield).toHaveBeenNthCalledWith(2, 111, 11);
      expect(onYield).toHaveBeenNthCalledWith(3, 1111, 111);
    });
  });

  describe('options.onSync', (): void => {
    test('`options.onSync` should work with sync mode', (): void => {
      let total = 45;

      const onSync = (): number => {
        return total;
      };

      const onYield = (value: number): void => {
        total = value;
      };

      const gen = reducerWithYieldFn(1);
      const [entity, result] = iterateEntity(gen, { onSync, onYield });

      expect(entity).toBe(1155);
      expect(entity).toBe(result);
    });

    test('`options.onSync` should work with async mode', async (): Promise<void> => {
      let total = 45;

      const onSync = (): number => {
        return total;
      };

      const onYield = (value: number): void => {
        total = value;
      };

      const gen = reducerWithYieldFnAsync(1);
      const [entity, result] = await iterateEntity(gen, { onSync, onYield });

      expect(entity).toBe(1155);
      expect(entity).toBe(result);
    });
  });

  describe('options.onReturn', (): void => {
    test('`options.onReturn` should work with sync mode', (): void => {
      const onReturn = jest.fn((): void => {});
      const gen = reducer();
      const [entity, result] = iterateEntity(gen, { onReturn });

      expect(entity).toBe(2);
      expect(result).toBe('xyz2');
      expect(onReturn).toHaveBeenCalledTimes(1);
      expect(onReturn).toHaveBeenCalledWith('xyz2', 2);
    });

    test('`options.onReturn` should work with async mode', async (): Promise<void> => {
      const onReturn = jest.fn((): void => {});
      const gen = reducerAsync();
      const [entity, result] = await iterateEntity(gen, { onReturn });

      expect(entity).toBe(2);
      expect(result).toBe('xyz2');
      expect(onReturn).toHaveBeenCalledTimes(1);
      expect(onReturn).toHaveBeenCalledWith('xyz2', 2);
    });
  });
});
