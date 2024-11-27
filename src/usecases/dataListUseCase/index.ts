import { EntityGenerator } from '@/types';
import { arrayUseCase } from '../arrayUseCase';
import { Data, DataListReducers, ExtractDataKeyValue } from './types';
import { getDataKeyValue } from './methods/getDataKeyValue';

export const dataListUseCase = <T extends Data>(): DataListReducers<T> => {
  const arrayReducers = arrayUseCase<T>();
  const { filterEntity } = arrayReducers;

  const filterEntityBy = <S extends T>(
    entity: S[],
    id: ExtractDataKeyValue<S>,
    expect = false,
  ): EntityGenerator<S[], S[]> => {
    return filterEntity(entity, (item: S): boolean => {
      const itemId = getDataKeyValue(item);

      return (itemId === id) === expect;
    });
  };

  const replaceEntity = function* <S extends T>(
    entity: S[],
    newItem: S,
    targetId: ExtractDataKeyValue<S> = getDataKeyValue(newItem),
  ): Generator<S[], S | null> {
    const index = entity.findIndex((item: S): boolean => {
      const id = getDataKeyValue(item);

      return id === targetId;
    });

    if (index === -1) {
      return null;
    }

    const targetItem = entity[index];
    const newEntity = entity.slice();

    newEntity[index] = newItem;

    yield newEntity;
    return targetItem;
  };

  return {
    ...arrayReducers,
    filterEntityBy,
    replaceEntity,
  };
};
