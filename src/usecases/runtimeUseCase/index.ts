import { runtimeDataMap } from '@/configs/runtimeDataMap';
import { RuntimeReducers } from './types';

export const runtimeUseCase = (): RuntimeReducers => {
  const generateId = (length = 24): string => {
    const chars: string[] = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const { length: charactersLength } = characters;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);

      chars.push(characters.charAt(randomIndex));
    }

    return chars.join('');
  };

  const getRuntimeData = <T, TKey = PropertyKey>(key: TKey): T => {
    return runtimeDataMap.get(key);
  };

  const setRuntimeData = <T, TKey = PropertyKey>(key: TKey, value: T): void => {
    runtimeDataMap.set(key, value);
  };

  return { generateId, getRuntimeData, setRuntimeData };
};
