export const identity = (v: unknown) => v;

/**
 * 在 channel 时有用到, 辅助函数
 */
export const konst = (v: boolean) => () => v;

/**
 * 永远返回 true
 */
export const kTrue = konst(true);

/**
 * 永远返回 false
 */
export const kFalse = konst(false);

/**
 * 返回一个新的函数, 用一个闭包值做控制, 保证回调函数只能调用一次
 */
export function once(fn: Function) {
  let called = false;
  return () => {
    if (called) {
      return;
    }
    called = true;
    fn();
  };
}

/**
 * 在 item 所属的数组中移除 item 这一项
 * 其实更简单可以使用: arr = arr.filter(it => it !== item)
 */
export function remove(array: any[], item: any) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

/**
 * 没有意义的空函数, 用来填充默认值或占位
 */
export let noop = () => {};

const kThrow = (err: Error) => {
  throw err;
};

const kReturn = (value: any) => ({ value, done: true });

/**
 * 这里是模拟 生成器(generator) 的 迭代器对象(generator()) 的行为
 * 同时满足 '可迭代协议([Symbol.iterator])' 和 '迭代器协议(next, {value,done})'
 */
export function makeIterator(
  next: Function,
  thro: Function = kThrow,
  name = 'iterator'
) {
  const iterator: any = {
    meta: { name },
    next,
    throw: thro,
    return: kReturn,
    isSagaIterator: true,
  };

  if (typeof Symbol !== 'undefined') {
    iterator[Symbol.iterator] = () => iterator;
  }
  return iterator;
}
