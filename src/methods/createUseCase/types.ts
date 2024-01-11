import { ReducerMap, UseCase } from '@/types';

export interface CreateUseCaseFactory<
  T extends ReducerMap,
  TUseCaseOptions extends object,
  TUsecase extends UseCase<T, TUseCaseOptions> = UseCase<T, TUseCaseOptions>
> {
  (): TUsecase;
}
