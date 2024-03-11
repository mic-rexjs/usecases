import { ReducerMap, UseCase } from '@/types';
import { CreateUseCaseFactory } from './types';

export const createUseCase = <
  T extends ReducerMap,
  TUseCaseOptions extends object,
  TUsecase extends UseCase<T, TUseCaseOptions>,
>(
  factory: CreateUseCaseFactory<T, TUseCaseOptions, TUsecase & UseCase<T, TUseCaseOptions>>,
): TUsecase => {
  return factory();
};
