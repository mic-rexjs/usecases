import { EntityGeneratorValues } from '@/types';
import { CreateEntityReducersOptions, CreateEntityReducersOptionsWithDefaults } from '../createEntityReducers/types';

export const initCreateEntityReducersOptions = <T, TUseCaseOptions extends object>(
  options?: CreateEntityReducersOptions<T, TUseCaseOptions>
): CreateEntityReducersOptionsWithDefaults<T, TUseCaseOptions> => {
  return {
    onGenerate<TResult>(newEntity: T, result: TResult): EntityGeneratorValues<T, TResult> {
      return [newEntity, result];
    },
    ...options,
  } as CreateEntityReducersOptionsWithDefaults<T, TUseCaseOptions>;
};
