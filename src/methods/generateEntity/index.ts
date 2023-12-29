import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  YieldEntityCallback,
} from '@/types';
import { GenerateEntityMethod, GenerateEntityOptions } from './types';
import { EntityStore } from '@/classes/EntityStore';

export const generateEntity = (<T, TResult>(
  generator: EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>,
  options: GenerateEntityOptions<T, TResult> = {}
): EntityGeneratorValues<T, TResult> | AsyncEntityGeneratorValues<T, TResult> => {
  const results: TResult[] = [];
  const { store = new EntityStore(void 0 as T), onYield, onReturn } = options;

  const generate = async (): Promise<EntityGeneratorValues<T, TResult>> => {
    for (;;) {
      const ret = generator.next(store.getValue());
      const { value, done } = ret instanceof Promise ? await ret : ret;
      const currentEntity = store.getValue();

      if (done) {
        const result = value as TResult;

        results[0] = result;
        onReturn?.(result, currentEntity);
        return [currentEntity, result] as EntityGeneratorValues<T, TResult>;
      }

      store.setValue(typeof value === 'function' ? (value as YieldEntityCallback<T>)(currentEntity) : value);
      onYield?.(store.getValue(), currentEntity);
    }
  };

  const promise = generate();

  if (results.length > 0) {
    return [store.getValue(), results[0]];
  }

  return promise;
}) as GenerateEntityMethod;
