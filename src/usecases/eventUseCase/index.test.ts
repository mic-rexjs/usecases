import { createEntityReducers } from '@/methods/createEntityReducers';
import { describe, expect, test } from '@jest/globals';
import { eventUseCase } from '.';

interface PartialEventOptions {
  onClick?(): void;

  onMove?(): void;
}

interface RequiredEventOptions {
  onLoad(): void;

  onFetch(): void;
}

interface Options extends PartialEventOptions, RequiredEventOptions {
  id: string;
}

describe('eventUseCase', (): void => {
  test('check type definination', (): void => {
    createEntityReducers({}, eventUseCase<PartialEventOptions>);
    createEntityReducers({}, eventUseCase<RequiredEventOptions>);
    createEntityReducers({}, eventUseCase<Options>);

    expect(0).toBe(0);
  });
});
