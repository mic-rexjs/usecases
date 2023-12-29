import './index';
import { describe, expect, test } from '@jest/globals';

// 仅仅是为了测试 `./index` 文件里的输出是否有类型错误
describe('index', (): void => {
  test('check types', (): void => {
    expect(0).toBe(0);
  });
});
