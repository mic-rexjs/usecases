import { CreateIdOptions, CreateKeyOptions, UtilsReducers, UtilsUseCase } from './types';
import { createUseCase } from '@/methods/createUseCase';

export const utilsUseCase = createUseCase((): UtilsUseCase => {
  let index = 0;

  return (): UtilsReducers => {
    const createKey = (options: CreateKeyOptions = {}): string => {
      const { length = 16, prefix = '', postfix = '', timestamp = Date.now() } = options;
      const idx = index++;
      const indexKey = idx.toString(36);
      const timestampKey = timestamp.toString(36);
      const randomKey = Math.random().toString(36);
      const { length: indexKeyLength } = indexKey;
      const { length: timestampKeyLength } = timestampKey;
      const subLength = Math.max(length - timestampKeyLength - indexKeyLength, 0);
      const subRandomKey = randomKey.substring(2, subLength + 2);

      const fullKey = `${subRandomKey}${timestampKey}${indexKey}`.replace(/[a-z]/g, (char: string): string => {
        return Math.random() > 0.5 ? char.toUpperCase() : char;
      });

      return `${prefix}${fullKey}${postfix}`;
    };

    const createId = (options?: CreateIdOptions): string => {
      return createKey(options);
    };

    return {
      createKey,
      createId,
    };
  };
});
