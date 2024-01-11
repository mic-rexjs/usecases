import { EntityReducers, EntityUseCase, Reducers, UseCase } from '@/types';
import { describe, expect, test } from '@jest/globals';
import { createUseCase } from '.';
import { objectUseCase } from '@/usecases/objectUseCase';

describe('createUseCase', (): void => {
  test('should return a normal usecase', (): void => {
    const emptyReducers = {};

    const usecase = createUseCase((): UseCase<Reducers> => {
      return (): Reducers => {
        return emptyReducers;
      };
    });

    const reducers = usecase();

    expect(typeof usecase).toBe('function');
    expect(reducers).toBe(emptyReducers);
  });

  test('should return an entity usecase', (): void => {
    const objectReducers = objectUseCase();

    const usecase = createUseCase((): EntityUseCase<object, EntityReducers<object, Record<never, never>>> => {
      return (): EntityReducers<object, Record<never, never>> => {
        return objectReducers;
      };
    });

    const reducers = usecase();

    expect(typeof usecase).toBe('function');
    expect(reducers).toBe(objectReducers);
  });
});
