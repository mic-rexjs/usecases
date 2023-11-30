import { EntityGenerator, EntityReducers } from '@/types';

export interface ArrayEntityFilter<T> {
  (item: T): boolean;
}

export type ArrayReducers<T> = EntityReducers<
  T[],
  {
    extractEntity<S extends T>(entity: S[], filter: ArrayEntityFilter<S>): S[];

    fillEntity<S extends T>(entity: S[], value: S, start?: number, end?: number): EntityGenerator<S[], S[]>;

    filterEntity<S extends T>(entity: S[], filter: ArrayEntityFilter<S>): EntityGenerator<S[], S[]>;

    popEntity<S extends T>(entity: S[]): EntityGenerator<S[], S | undefined>;

    pushEntity<S extends T>(entity: S[], ...items: S[]): EntityGenerator<S[], number>;

    shiftEntity<S extends T>(entity: S[]): EntityGenerator<S[], S | undefined>;

    spliceEntity<S extends T>(
      entity: S[],
      start: number,
      deleteCount?: number,
      ...items: S[]
    ): EntityGenerator<S[], S[]>;

    unshiftEntity<S extends T>(entity: S[], ...items: S[]): EntityGenerator<S[], number>;
  }
>;
