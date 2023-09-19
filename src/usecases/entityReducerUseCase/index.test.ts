import { describe, expect, jest, test } from '@jest/globals';
import { entityReducerUseCase } from '.';
import { AsyncEntityGenerator, EntityGenerator, EntityReducers, EntityUseCase } from '@/types';
import { entityUseCase } from '../entityUseCase';

interface Data {
  value: number;
}

interface Options<T> {
  defaultData?: T;
}

type TestReducers<T extends Data> = EntityReducers<
  T,
  {
    getResult(entity: T, value: number): number;
    getResultAsync(entity: T, value: number): Promise<number>;
    add(entity: T, value: number): EntityGenerator<T, string>;
    addAsync(entity: T, value: number): AsyncEntityGenerator<T, string>;
    addListAsync(entity: T, values: number[]): AsyncEntityGenerator<T, string>;
  }
>;

type TestGeneratedReducers<T extends Data, TResult> = EntityReducers<
  T,
  {
    getResult(entity: T, value: number): number;
    add(entity: T, value: number): TResult;
    addAsync(entity: T, value: number): Promise<TResult>;
  }
>;

const testUseCase = <T extends Data>(options: Options<T> = {}): TestReducers<T> => {
  const entityReducers = entityUseCase<T>();

  const getResult = (entity: T, value: number): number => {
    const { defaultData } = options;
    const { value: defaultValue = 0 } = defaultData || {};

    return entity.value + value + defaultValue;
  };

  const getResultAsync = async (entity: T, value: number): Promise<number> => {
    await Promise.resolve(null);

    return entity.value + value;
  };

  const add = function* (entity: T, value: number): EntityGenerator<T, string> {
    const newEntity = yield {
      ...entity,
      value: entity.value + value,
    };

    return `[${newEntity.value}]`;
  };

  const addAsync = async function* addAsync(entity: T, value: number): AsyncEntityGenerator<T, string> {
    await Promise.resolve(null);

    const newEntity = yield {
      ...entity,
      value: entity.value + value,
    };

    await Promise.resolve(null);
    return `[${newEntity.value}]`;
  };

  const addListAsync = async function* addListAsync(entity: T, values: number[]): AsyncEntityGenerator<T, string> {
    let newEntity = entity;

    for (const value of values) {
      await Promise.resolve(null);

      newEntity = yield {
        ...entity,
        value: entity.value + value,
      };
    }

    return `[${newEntity.value}]`;
  };

  return { ...entityReducers, getResult, getResultAsync, add, addAsync, addListAsync };
};

let mockSetEntity: TestReducers<Data>['setEntity'] | null = null;

const testUseCaseWithMockSetEntity = (): TestReducers<Data> => {
  const testReducers = testUseCase<Data>();
  const { setEntity } = testReducers;

  mockSetEntity = jest.fn(setEntity);

  return { ...testReducers, setEntity: mockSetEntity };
};

describe('entityReducerUseCase', (): void => {
  describe('createEntityReducers', (): void => {
    const { createEntityReducers } = entityReducerUseCase();

    describe('entity', (): void => {
      test('check `entity.value` on set entity callback - entity mode', async (): Promise<void> => {
        let prevValue = 0;
        const { setEntity } = createEntityReducers({ value: 1 }, testUseCase);

        await new Promise((res: (v: null) => void): void => {
          setEntity((entity: Data): Data => {
            const { value } = entity;

            prevValue = value;
            return entity;
          });

          res(null);
        });

        expect(prevValue).toBe(1);
      });

      test('check `entity.value` on set entity callback - non-entity mode', async (): Promise<void> => {
        let prevValue = 0;
        const { setEntity } = createEntityReducers(testUseCase);

        await new Promise((res: (v: null) => void): void => {
          setEntity({ value: 1 }, (entity: Data): Data => {
            const { value } = entity;

            prevValue = value;
            return entity;
          });

          res(null);
        });

        expect(prevValue).toBe(1);
      });

      test('check `entity.value` after call setEntity on set entity callback - entity mode', async (): Promise<void> => {
        let prevValue = 0;
        const { setEntity } = createEntityReducers({ value: 1 }, testUseCase);

        setEntity({ value: 2 });

        await new Promise((res: (v: null) => void): void => {
          setEntity((entity: Data): Data => {
            const { value } = entity;

            prevValue = value;
            return entity;
          });

          res(null);
        });

        expect(prevValue).toBe(2);
      });

      test('check `entity.value` after call setEntity on set entity callback - non-entity mode', async (): Promise<void> => {
        let prevEntity = 0;
        const { setEntity } = createEntityReducers(testUseCase);

        setEntity({ value: 1 }, { value: 2 });

        await new Promise((res: (v: null) => void): void => {
          setEntity({ value: 3 }, (entity: Data): Data => {
            const { value } = entity;

            prevEntity = value;
            return entity;
          });

          res(null);
        });

        expect(prevEntity).toBe(3);
      });
    });

    describe('non-generator mode', (): void => {
      test('non-generator should work - entity mode', (): void => {
        const { getResult } = createEntityReducers({ value: 100 }, testUseCase);
        const value = getResult(1);

        expect(value).toBe(101);
      });

      test('non-generator should work - non-entity mode', (): void => {
        const { getResult } = createEntityReducers(testUseCase);
        const value = getResult({ value: 100 }, 1);

        expect(value).toBe(101);
      });
    });

    describe('non-generator async mode', (): void => {
      test('non-generator async mode should work - entity mode', async (): Promise<void> => {
        const { getResultAsync } = createEntityReducers({ value: 100 }, testUseCase);
        const value = await getResultAsync(1);

        expect(value).toBe(101);
      });

      test('non-generator async mode should work - non-entity mode', async (): Promise<void> => {
        const { getResultAsync } = createEntityReducers(testUseCase);
        const value = await getResultAsync({ value: 100 }, 1);

        expect(value).toBe(101);
      });
    });

    describe('yield entity mode', (): void => {
      test('`yield entity` should work - entity mode', (): void => {
        const { add } = createEntityReducers({ value: 1 }, testUseCase);
        const [entity1, result1] = add(2);
        const [entity2, result2] = add(3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(6);
        expect(result2).toBe('[6]');
      });

      test('`yield entity` should work without entityMode', (): void => {
        const { add } = createEntityReducers(testUseCase);
        const [entity1, result1] = add({ value: 1 }, 2);
        const [entity2, result2] = add({ value: 1 }, 3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(4);
        expect(result2).toBe('[4]');
      });
    });

    describe('yield entity async mode', (): void => {
      test('`yield entity` async mode should work - entity mode', async (): Promise<void> => {
        const { addAsync } = createEntityReducers({ value: 1 }, testUseCase);
        const [entity1, result1] = await addAsync(2);
        const [entity2, result2] = await addAsync(3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(6);
        expect(result2).toBe('[6]');
      });

      test('`yield entity` async mode should work - non-entity mode', async (): Promise<void> => {
        const { addAsync } = createEntityReducers(testUseCase);
        const [entity1, result1] = await addAsync({ value: 1 }, 2);
        const [entity2, result2] = await addAsync({ value: 1 }, 3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(4);
        expect(result2).toBe('[4]');
      });
    });

    describe('`setEntity` should be called', (): void => {
      test('`setEntity` should not be called after a normal method executed - entity mode', (): void => {
        const { getResult } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        getResult(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(0);
      });

      test('`setEntity` should not be called after a normal method executed - non-entity mode', (): void => {
        const { getResult } = createEntityReducers(testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        getResult({ value: 1 }, 100);
        expect(mockSetEntity).toHaveBeenCalledTimes(0);
      });

      test('`setEntity` should be called after `yield` - entity mode', (): void => {
        const { add } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        add(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called after `yield` - non-entity mode', (): void => {
        const { add } = createEntityReducers(testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        add({ value: 1 }, 100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called after `yield` on async mode - entity mode', async (): Promise<void> => {
        const { addAsync } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addAsync(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called after `yield` on async mode - non-entity mode', async (): Promise<void> => {
        const { addAsync } = createEntityReducers(testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addAsync({ value: 1 }, 100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called multiple times - entity mode', async (): Promise<void> => {
        const { addListAsync } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);
        const list = [3, 5, 6, 8];

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addListAsync(list);
        expect(mockSetEntity).toHaveBeenCalledTimes(list.length);
      });

      test('`setEntity` should be called multiple times - non-entity mode', async (): Promise<void> => {
        const { addListAsync } = createEntityReducers(testUseCaseWithMockSetEntity);
        const list = [3, 5, 6, 8];

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addListAsync({ value: 1 }, list);
        expect(mockSetEntity).toHaveBeenCalledTimes(list.length);
      });
    });

    describe('options', (): void => {
      test('should work without any options - entity mode', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers({ value: 1 }, mockUseCase);
        expect(mockUseCase).toHaveBeenCalledTimes(1);
      });

      test('should work without any options - non-entity mode', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers(mockUseCase);
        expect(mockUseCase).toHaveBeenCalledTimes(1);
      });

      test('`options.onChange` should be called after entity changed - entity mode', (): void => {
        const onChange = jest.fn((): void => {});

        const { setEntity } = createEntityReducers({ value: 1 }, testUseCase, {
          onChange,
        });

        setEntity({ value: 2 });
        setEntity({ value: 3 });

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(1, { value: 2 }, { value: 1 });
        expect(onChange).toHaveBeenNthCalledWith(2, { value: 3 }, { value: 2 });
      });

      test('`options.onChange` should be called after entity changed - non-entity mode', (): void => {
        const onChange = jest.fn((): void => {});

        const { setEntity } = createEntityReducers(testUseCase, {
          onChange,
        });

        setEntity({ value: 1 }, { value: 2 });
        setEntity({ value: 1 }, { value: 3 });

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(1, { value: 2 }, { value: 1 });
        expect(onChange).toHaveBeenNthCalledWith(2, { value: 3 }, { value: 1 });
      });

      test('`options.onGenerate` should be called after generator done - entity mode', async (): Promise<void> => {
        const onGenerate = jest.fn(({ value }: Data, result: string): string => {
          return `${result}(${value})`;
        });

        const { getResult, add, addAsync } = createEntityReducers(
          { value: 1 },
          testUseCase as unknown as EntityUseCase<Data, TestGeneratedReducers<Data, string>>,
          {
            onGenerate,
          }
        );

        getResult(100);
        expect(onGenerate).toHaveBeenCalledTimes(0);

        const result1 = add(2);
        expect(onGenerate).toHaveBeenCalledTimes(1);
        expect(result1).toBe('[3](3)');

        const result2 = await addAsync(2);
        expect(onGenerate).toHaveBeenCalledTimes(2);
        expect(result2).toBe('[5](5)');
      });

      test('`options.onGenerate` should be called after generator done - non-entity mode', async (): Promise<void> => {
        const onGenerate = jest.fn(({ value }: Data, result: string): string => {
          return `${result}(${value})`;
        });

        const { getResult, add, addAsync } = createEntityReducers(
          testUseCase as unknown as EntityUseCase<Data, TestGeneratedReducers<Data, string>>,
          {
            onGenerate,
          }
        );

        getResult({ value: 1 }, 100);
        expect(onGenerate).toHaveBeenCalledTimes(0);

        const result1 = add({ value: 1 }, 2);
        expect(onGenerate).toHaveBeenCalledTimes(1);
        expect(result1).toBe('[3](3)');

        const result2 = await addAsync({ value: 3 }, 2);
        expect(onGenerate).toHaveBeenCalledTimes(2);
        expect(result2).toBe('[5](5)');
      });

      test('`options.defaultData` should be the initial entity - entity mode', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers({ value: 1 }, mockUseCase, { defaultData: { value: 2 } });

        expect(mockUseCase).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ defaultData: { value: 2 } });
      });

      test('`options.defaultData` should be the initial entity - non-entity mode', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers(mockUseCase, { defaultData: { value: 2 } });

        expect(mockUseCase).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ defaultData: { value: 2 } });
      });
    });
  });
});
