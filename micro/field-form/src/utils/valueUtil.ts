import get from 'rc-util/lib/utils/get';
import set from 'rc-util/lib/utils/set';

import { NamePath, InternalNamePath, Store, StoreValue } from '../interface';
import { toArray } from './typeUtil';

/**
 * 把参数转为数组, 没有什么神奇操作
 */
export function getNamePath(path: NamePath | null): InternalNamePath {
  return toArray(path);
}

export function getValue(store: Store, namePath: InternalNamePath) {
  const value = get(store, namePath);
  return value;
}

export function setValue(
  store: Store,
  namePath: InternalNamePath,
  value: StoreValue,
  removeIfUndefined = false,
): Store {
  const newStore = set(store, namePath, value, removeIfUndefined);
  return newStore;
}

function isObject(obj: StoreValue) {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Copy values into store and return a new values object
 * ({ a: 1, b: { c: 2 } }, { a: 4, b: { d: 5 } }) => { a: 4, b: { c: 2, d: 5 } }
 */
function internalSetValues<T>(store: T, values: T): T {
  const newStore: T = (Array.isArray(store) ? [...store] : { ...store }) as T;

  if (!values) {
    return newStore;
  }

  Object.keys(values).forEach(key => {
    const prevValue = newStore[key];
    const value = values[key];

    // If both are object (but target is not array), we use recursion to set deep value
    const recursive = isObject(prevValue) && isObject(value);
    newStore[key] = recursive ? internalSetValues(prevValue, value || {}) : value;
  });

  return newStore;
}

export function setValues<T>(store: T, ...restValues: T[]): T {
  return restValues.reduce(
    (current: T, newStore: T): T => internalSetValues<T>(current, newStore),
    store,
  );
}

type SimilarObject = string | number | {};

export function isSimilar(source: SimilarObject, target: SimilarObject) {
  // 直接比较引用(引用类型) / 值(基础类型)
  if (source === target) return true;

  // 一真值, 一假值, 肯定不相等
  if ((!source && target) || (source && !target)) return false;

  // 1.两个都是假值, 2.两个都是真值,且如果其中有2个基础值, 则肯定不相等,

  /**
   * 如果两个都是是基础类型, 到这一步, 肯定是不相等的, 否则过不了第一次 === 判断
   * 如果是其中一个事基础类型, 肯定不可能和引用类型全
   * 如果是两个 falsy, 那么也肯定不可能是全等的(同理, 第一次 === 判断)
   *
   * 综上, 只要有 falsy 或者基础类型, 那么到这一步, 一定是不等的
   */
  if (!source || !target || typeof source !== 'object' || typeof target !== 'object') return false;

  // 从这里开始, 就是两个引用类型的比较了, 浅比较他们 key
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);
  const keys = new Set([...sourceKeys, ...targetKeys]);

  // TODO, 为啥要浅拷贝一次呢
  return [...keys].every(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    // TODO, 这里全是 function, 直接判 true 了, 不懂为什么
    if (typeof sourceValue === 'function' && typeof targetValue === 'function') {
      return true;
    }
    return sourceValue === targetValue;
  });
}
