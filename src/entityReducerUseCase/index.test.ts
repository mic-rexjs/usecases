import { describe, expect, jest, test } from '@jest/globals';
import { entityReducerUseCase } from '.';
import { AsyncEntityGenerator, EntityGenerator, EntityReducers, EntityUseCase } from '../types';
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
      test('check `entity.value` on set entity callback', async (): Promise<void> => {
        const { setEntity } = createEntityReducers({ value: 1 }, testUseCase);

        return new Promise((res: () => void): void => {
          setEntity((entity: Data): Data => {
            const { value } = entity;

            expect(value).toBe(1);
            return entity;
          });

          res();
        });
      });

      test('check `entity.value` after call setEntity on set entity callback', async (): Promise<void> => {
        const { setEntity } = createEntityReducers({ value: 1 }, testUseCase);

        setEntity({ value: 2 });

        return new Promise((res: () => void): void => {
          setEntity((entity: Data): Data => {
            const { value } = entity;

            expect(value).toBe(2);
            return entity;
          });

          res();
        });
      });
    });

    describe('non-generator mode', (): void => {
      test('non-generator should work', (): void => {
        const { getResult } = createEntityReducers({ value: 100 }, testUseCase);
        const value = getResult(1);

        expect(value).toBe(101);
      });
    });

    describe('non-generator async mode', (): void => {
      test('non-generator async mode should work', async (): Promise<void> => {
        const { getResultAsync } = createEntityReducers({ value: 100 }, testUseCase);
        const value = await getResultAsync(1);

        expect(value).toBe(101);
      });
    });

    describe('yield entity mode', (): void => {
      test('`yield entity` should work', (): void => {
        const { add } = createEntityReducers({ value: 1 }, testUseCase);
        const [entity1, result1] = add(2);
        const [entity2, result2] = add(3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(6);
        expect(result2).toBe('[6]');
      });
    });

    describe('yield entity async mode', (): void => {
      test('`yield entity` async mode should work', async (): Promise<void> => {
        const { addAsync } = createEntityReducers({ value: 1 }, testUseCase);
        const [entity1, result1] = await addAsync(2);
        const [entity2, result2] = await addAsync(3);

        expect(entity1.value).toBe(3);
        expect(result1).toBe('[3]');
        expect(entity2.value).toBe(6);
        expect(result2).toBe('[6]');
      });
    });

    describe('`setEntity` should be called', (): void => {
      test('`setEntity` should not be called after a normal method executed', (): void => {
        const { getResult } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        getResult(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(0);
      });

      test('`setEntity` should be called after `yield`', (): void => {
        const { add } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        add(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called after `yield` on async mode', async (): Promise<void> => {
        const { addAsync } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addAsync(100);
        expect(mockSetEntity).toHaveBeenCalledTimes(1);
      });

      test('`setEntity` should be called multiple times', async (): Promise<void> => {
        const { addListAsync } = createEntityReducers({ value: 1 }, testUseCaseWithMockSetEntity);
        const list = [3, 5, 6, 8];

        expect(mockSetEntity).toHaveBeenCalledTimes(0);
        await addListAsync(list);
        expect(mockSetEntity).toHaveBeenCalledTimes(list.length);
      });
    });

    describe('options', (): void => {
      test('should work without any options', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers({ value: 1 }, mockUseCase);
        expect(mockUseCase).toHaveBeenCalledTimes(1);
      });

      test('`options.onChange` should be called after entity changed', (): void => {
        const onChange = jest.fn((): void => {});

        const { setEntity } = createEntityReducers({ value: 1 } as Data, testUseCase, {
          onChange,
        });

        setEntity({ value: 2 });
        setEntity({ value: 3 });

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(1, { value: 2 }, { value: 1 });
        expect(onChange).toHaveBeenNthCalledWith(2, { value: 3 }, { value: 2 });
      });

      test('`options.onGenerate` should be called after generator done', async (): Promise<void> => {
        const onGenerate = jest.fn(({ value }: Data, result: string): string => {
          return `${result}(${value})`;
        });

        const { getResult, add, addAsync } = createEntityReducers(
          { value: 1 } as Data,
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

      test('`options.defaultData` should be the initial entity', (): void => {
        const mockUseCase = jest.fn(testUseCase);

        createEntityReducers({ value: 1 }, mockUseCase, { defaultData: { value: 2 } });

        expect(mockUseCase).toHaveBeenCalledTimes(1);
        expect(mockUseCase).toHaveBeenCalledWith({ defaultData: { value: 2 } });
      });
    });
  });
});
