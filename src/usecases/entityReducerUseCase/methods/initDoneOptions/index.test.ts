import { describe, expect, jest, test } from '@jest/globals';
import { initDoneOptions } from '.';
import { createRef } from '@/methods/createRef';
import { entityUseCase } from '@/usecases/entityUseCase';
import { EntityReducers } from '@/types';

describe('initDoneOptions', (): void => {
  describe('onSync', (): void => {
    test('should return current entity', (): void => {
      const entity = {};
      const entityRef = createRef(entity);
      const reducerRef = createRef((): void => {});
      const reducers = entityUseCase<object>();
      const { onSync } = initDoneOptions(entityRef, reducerRef, reducers);
      const result = onSync?.();

      expect(result).toBe(entity);
    });
  });

  describe('onYield', (): void => {
    test('should trigger `onChange` event when entity is not equal oldEntity', (): void => {
      const entity = {};
      const newEntity = {};
      const entityRef = createRef(entity);
      const reducerRef = createRef((): void => {});
      const reducers = entityUseCase<object>();
      const onChange = jest.fn<(newEntity: object, oldEntity: object) => void>();
      const { onYield } = initDoneOptions(entityRef, reducerRef, reducers, { onChange });

      onYield?.(newEntity, entity);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(newEntity, entity);
    });

    test('should not trigger `onChange` event when entity is equal oldEntity', (): void => {
      const entity = {};
      const entityRef = createRef(entity);
      const reducerRef = createRef((): void => {});
      const reducers = entityUseCase<object>();
      const onChange = jest.fn<(newEntity: object, oldEntity: object) => void>();
      const { onYield } = initDoneOptions(entityRef, reducerRef, reducers, { onChange });

      onYield?.(entity, entity);

      expect(onChange).toHaveBeenCalledTimes(0);
    });

    test('should call `setEntity` reducer when current reducer is not `setEntity`', (): void => {
      const entity = {};
      const newEntity = {};
      const entityRef = createRef(entity);
      const reducerRef = createRef((): void => {});
      const reducers = entityUseCase<object>();
      const setEntity = jest.spyOn(reducers, 'setEntity');
      const { onYield } = initDoneOptions(entityRef, reducerRef, reducers);

      onYield?.(newEntity, entity);

      expect(setEntity).toHaveBeenCalledTimes(1);
      expect(setEntity).toHaveBeenCalledWith(entity, newEntity);
    });

    test('should not call `setEntity` reducer when current reducer is `setEntity`', (): void => {
      const entity = {};
      const newEntity = {};
      const entityRef = createRef(entity);
      const setEntity = jest.fn();
      const reducers = { ...entityUseCase<object>(), setEntity } as EntityReducers<object>;
      const reducerRef = createRef(setEntity);
      const { onYield } = initDoneOptions(entityRef, reducerRef, reducers);

      onYield?.(newEntity, entity);
      expect(setEntity).toHaveBeenCalledTimes(0);
    });
  });
});
