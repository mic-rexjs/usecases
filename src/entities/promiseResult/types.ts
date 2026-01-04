import { RejectedError } from '../rejectedError/types';

export interface PromiseResult<T, TError> {
  value: T;

  error: RejectedError<TError> | null;
}
