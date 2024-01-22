export const isGenerator = <T>(target: T, typeSymbol?: symbol): boolean => {
  const symbols = typeSymbol ? [typeSymbol] : [Symbol.iterator, Symbol.asyncIterator];

  for (const key of symbols) {
    const iterator = target?.[key as keyof T];

    if (typeof iterator !== 'function') {
      continue;
    }

    const generator = iterator.call(target);

    // 判断 `iterator` 返回的 `generator` 是否为自身，这是 `generator` 的特性
    if (generator === target) {
      return true;
    }
  }

  return false;
};
