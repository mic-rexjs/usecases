import { EntityGenerator, EntityReducers } from '../types';

export interface ArrayEntityFilter<T> {
  (item: T): boolean;
}

export type ArrayReducers<T> = EntityReducers<
  T[],
  {
    fillEntity(entity: T[], value: T, start?: number, end?: number): EntityGenerator<T[], T[]>;

    filterEntity(entity: T[], filter: ArrayEntityFilter<T>): EntityGenerator<T[], T[]>;

    popEntity(entity: T[]): EntityGenerator<T[], T | undefined>;

    pushEntity(entity: T[], ...items: T[]): EntityGenerator<T[], number>;

    shiftEntity(entity: T[]): EntityGenerator<T[], T | undefined>;

    spliceEntity(entity: T[], start: number, deleteCount?: number, ...items: T[]): EntityGenerator<T[], T[]>;

    unshiftEntity(entity: T[], ...items: T[]): EntityGenerator<T[], number>;
  }
>;
