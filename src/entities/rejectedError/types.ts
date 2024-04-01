export type RejectedCode = number | string;

export interface RejectedError<T = null> {
  code: RejectedCode;

  msg: string;

  data: T;
}
