import { EntityGenerator } from '@/types';
import { entityUseCase } from '../entityUseCase';
import { ArrayEntityFilter, ArrayReducers } from './types';

export const arrayUseCase = <T>(): ArrayReducers<T> => {
  const entityReducers = entityUseCase<T[]>();

  const extractEntity = <S extends T>(entity: S[], filter: ArrayEntityFilter<S>): S[] => {
    return entity.filter(filter);
  };

  const fillEntity = function* <S extends T>(
    entity: S[],
    value: S,
    start?: number,
    end?: number,
  ): EntityGenerator<S[], S[]> {
    const newEntity = entity.slice();

    newEntity.fill(value, start, end);
    return yield newEntity;
  };

  const filterEntity = function* <S extends T>(entity: S[], filter: ArrayEntityFilter<S>): EntityGenerator<S[], S[]> {
    return yield entity.filter(filter);
  };

  const popEntity = function* <S extends T>(entity: S[]): EntityGenerator<S[], S | undefined> {
    const newEntity = entity.slice();
    const item = newEntity.pop();

    yield newEntity;
    return item;
  };

  const pushEntity = function* <S extends T>(entity: S[], ...items: S[]): EntityGenerator<S[], number> {
    const newEntity = [...entity, ...items];
    const { length } = newEntity;

    yield newEntity;
    return length;
  };

  const shiftEntity = function* <S extends T>(entity: S[]): EntityGenerator<S[], S | undefined> {
    const newEntity = entity.slice();
    const item = newEntity.shift();

    yield newEntity;
    return item;
  };

  const spliceEntity = function* <S extends T>(
    entity: S[],
    ...args: [start: number, deleteCount?: number, ...items: S[]]
  ): EntityGenerator<S[], S[]> {
    const newEntity = entity.slice();
    const splicedItems = newEntity.splice(...(args as [number, number, ...S[]]));

    yield newEntity;
    return splicedItems;
  };

  const unshiftEntity = function* <S extends T>(entity: S[], ...items: S[]): EntityGenerator<S[], number> {
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
