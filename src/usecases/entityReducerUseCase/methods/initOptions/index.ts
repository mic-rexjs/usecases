import {
  CreateEntityReducersOptions,
  CreateEntityReducersOptionsWithDefaults,
} from '@/usecases/entityReducerUseCase/types';

import { EntityGeneratorValues, Reducer } from '@/types';

export const initOptions = <T, TUseCaseOptions extends object>(
  options?: CreateEntityReducersOptions<T, TUseCaseOptions>
): CreateEntityReducersOptionsWithDefaults<T, TUseCaseOptions> => {
  return {
    onGenerate<TResult>(newEntity: T, result: TResult): EntityGeneratorValues<T, TResult> {
      return [newEntity, result];
    },
    onMap(reducer: Reducer): Reducer {
      return reducer;
    },
    ...options,
  } as CreateEntityReducersOptionsWithDefaults<T, TUseCaseOptions>;
};
