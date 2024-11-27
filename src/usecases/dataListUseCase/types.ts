import { EntityGenerator, EntityReducers } from '@/types';
import { ArrayReducers } from '../arrayUseCase/types';

export interface IdOwner {
  id: string | number;
}

export interface _IdOwner {
  _id: string | number;
}

export interface KeyOwner {
  key: string | number;
}

export type Data = IdOwner | _IdOwner | KeyOwner;

export type DataKeys = '_id' | 'id' | 'key';

export type ExtractDataKeyValue<T extends Data> = T[keyof T & DataKeys];

export type DataListReducers<T extends Data> = EntityReducers<
  T[],
  {
    filterEntityBy<S extends T>(
      entity: S[],
      target: ExtractDataKeyValue<S>,
      expect?: boolean,
    ): EntityGenerator<S[], S[]>;

    replaceEntity<S extends T>(
      entity: S[],
      newItem: S,
      target?: ExtractDataKeyValue<S>,
    ): EntityGenerator<S[], S | null>;
  },
  ArrayReducers<T>
>;
