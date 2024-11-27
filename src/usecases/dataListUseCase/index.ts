import { EntityGenerator } from '@/types';
import { arrayUseCase } from '../arrayUseCase';
import { Data, DataListReducers, DataKeyValue } from './types';
import { getDataKeyValue } from './methods/getDataKeyValue';

export const dataListUseCase = <T extends Data>(): DataListReducers<T> => {
  const arrayReducers = arrayUseCase<T>();
  const { filterEntity } = arrayReducers;

  const filterEntityBy = <S extends T>(
    entity: S[],
    target: DataKeyValue,
    expect = false,
  ): EntityGenerator<S[], S[]> => {
    return filterEntity(entity, (item: S): boolean => {
      const value = getDataKeyValue(item);

      return (value === target) === expect;
    });
  };

  const replaceEntity = function* <S extends T>(
    entity: S[],
    newItem: S,
    target = getDataKeyValue(newItem),
  ): Generator<S[], S | null> {
    const index = entity.findIndex((item: S): boolean => {
      const value = getDataKeyValue(item);

      return value === target;
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
