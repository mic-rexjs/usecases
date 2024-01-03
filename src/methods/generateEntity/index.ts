import { AsyncEntityGenerator, EntityGenerator, EntityGeneratorValues, YieldEntityCallback } from '@/types';
import { GenerateEntityMethod, GenerateEntityOptions } from './types';
import { EntityStore } from '@/classes/EntityStore';

export const generateEntity = (<T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
  generator: EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>,
  options: GenerateEntityOptions<T, TResult, TReturn> = {}
): TReturn | Promise<TReturn> => {
  const results: TResult[] = [];

  const {
    store = new EntityStore(void 0 as T),
    onYield,
    onReturn,
    onGenerate = (newEntity: T, result: TResult): EntityGeneratorValues<T, TResult> => {
      return [newEntity, result] as EntityGeneratorValues<T, TResult>;
    },
  } = options;

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

      const newEntity = typeof value === 'function' ? (value as YieldEntityCallback<T>)(currentEntity) : value;

      if (onYield?.(newEntity, currentEntity)) {
        continue;
      }

      store.setValue(newEntity);
    }
  };

  const promise = generate();

  if (results.length > 0) {
    return onGenerate(store.getValue(), results[0]) as TReturn;
  }

  return promise.then(([entity, value]: EntityGeneratorValues<T, TResult>): TReturn => {
    return onGenerate(entity, value) as TReturn;
  });
}) as GenerateEntityMethod;
