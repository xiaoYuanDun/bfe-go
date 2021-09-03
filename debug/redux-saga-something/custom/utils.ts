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
