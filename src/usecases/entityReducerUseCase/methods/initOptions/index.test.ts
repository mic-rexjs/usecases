import { describe, expect, test } from '@jest/globals';
import { initOptions } from '.';

describe('initOptions', (): void => {
  test('should return the provided `onGenerate` event', (): void => {
    const onGenerate = (): void => {};
    const options = initOptions({ onGenerate });

    expect(options.onGenerate).toBe(onGenerate);
  });

  test('should return default `onGenerate` if options has not provided', (): void => {
    const { onGenerate } = initOptions();

    expect(typeof onGenerate).toBe('function');
  });

  test('should default `onGenerate` should return entity and result from arguments', (): void => {
    const { onGenerate } = initOptions();
    const entity = {};
    const result = {};
    const [newEntity, newResult] = onGenerate(entity, result) as [object, object];

    expect(newEntity).toBe(entity);
    expect(newResult).toBe(result);
  });
});
