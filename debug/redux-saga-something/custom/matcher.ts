import { kTrue } from './utils';
import * as is from './is';

export const array = (patterns) => (input) =>
  patterns.some((p) => matcher(p)(input));
export const predicate = (predicate) => (input) => predicate(input);
export const string = (pattern) => (input) => input.type === String(pattern);
export const symbol = (pattern) => (input) => input.type === pattern;

// 匹配所有
export const wildcard = () => kTrue;

/**
 * 通过 pattern 构建一个匹配校验函数
 *
 * 比如, 当 pattern 是 string 时, 用文件中的 string 方法, 返回一个持有 pattern 值的校验闭包函数
 */
export default function matcher(pattern) {
  // prettier-ignore
  const matcherCreator = (
        pattern === '*'            ? wildcard
      : is.string(pattern)         ? string
      : is.array(pattern)          ? array
      : is.stringableFunc(pattern) ? string
      : is.func(pattern)           ? predicate
      : is.symbol(pattern)         ? symbol
      : null
    )

  if (matcherCreator === null) {
    throw new Error(`invalid pattern: ${pattern}`);
  }

  return matcherCreator(pattern);
}
