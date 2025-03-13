import { InferableUseCase, ReducerMap, UseCase } from '@/types';
import { CreateUseCaseFactory } from './types';

export const createUseCase = <
  T extends ReducerMap,
  TUseCaseOptions extends object,
  TUsecase extends UseCase<T, TUseCaseOptions>,
>(
  factory: CreateUseCaseFactory<T, TUseCaseOptions, InferableUseCase<T, TUseCaseOptions, TUsecase>>,
): TUsecase => {
  return factory();
};
