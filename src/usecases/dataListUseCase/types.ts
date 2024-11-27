import { EntityGenerator, EntityReducers } from '@/types';
import { ArrayReducers } from '../arrayUseCase/types';

export type DataKeyValue = number | string;

export interface IdOwner {
  id: DataKeyValue;
}

export interface _IdOwner {
  _id: DataKeyValue;
}

export interface KeyOwner {
  key: DataKeyValue;
}

export type Data = IdOwner | _IdOwner | KeyOwner;

export type DataListReducers<T extends Data> = EntityReducers<
  T[],
  {
    filterEntityBy<S extends T>(entity: S[], target: DataKeyValue, expect?: boolean): EntityGenerator<S[], S[]>;

    replaceEntity<S extends T>(entity: S[], newItem: S, target?: DataKeyValue): EntityGenerator<S[], S | null>;
  },
  ArrayReducers<T>
>;
