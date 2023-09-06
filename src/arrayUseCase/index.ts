import { EntityGenerator } from '../types';
import { entityUseCase } from '../entityUseCase';
import { ArrayEntityFilter, ArrayReducers } from './types';

export const arrayUseCase = <T>(): ArrayReducers<T> => {
  const entityReducers = entityUseCase<T[]>();

  const extractEntity = (entity: T[], filter: ArrayEntityFilter<T>): T[] => {
    return entity.filter(filter);
  };

  const fillEntity = function* (entity: T[], value: T, start?: number, end?: number): EntityGenerator<T[], T[]> {
    const newEntity = entity.slice();

    newEntity.fill(value, start, end);
    return yield newEntity;
  };

  const filterEntity = function* (entity: T[], filter: ArrayEntityFilter<T>): EntityGenerator<T[], T[]> {
    return yield entity.filter(filter);
  };

  const popEntity = function* (entity: T[]): EntityGenerator<T[], T | undefined> {
    const newEntity = entity.slice();
    const item = newEntity.pop();

    yield newEntity;
    return item;
  };

  const pushEntity = function* (entity: T[], ...items: T[]): EntityGenerator<T[], number> {
    const newEntity = [...entity, ...items];
    const { length } = newEntity;

    yield newEntity;
    return length;
  };

  const shiftEntity = function* (entity: T[]): EntityGenerator<T[], T | undefined> {
    const newEntity = entity.slice();
    const item = newEntity.shift();

    yield newEntity;
    return item;
  };

  const spliceEntity = function* (
    entity: T[],
    ...args: [start: number, deleteCount?: number, ...items: T[]]
  ): EntityGenerator<T[], T[]> {
    const newEntity = entity.slice();
    const splicedItems = newEntity.splice(...(args as [number, number, ...T[]]));

    yield newEntity;
    return splicedItems;
  };

  const unshiftEntity = function* (entity: T[], ...items: T[]): EntityGenerator<T[], number> {
    const newEntity = [...items, ...entity];
    const { length } = newEntity;

    yield newEntity;
    return length;
  };

  return {
    ...entityReducers,
    extractEntity,
    fillEntity,
    filterEntity,
    popEntity,
    pushEntity,
    shiftEntity,
    spliceEntity,
    unshiftEntity,
  };
};
