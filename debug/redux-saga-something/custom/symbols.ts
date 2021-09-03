/**
 * redux-saga 库中对于不同类型的 ACTION, 使用不同的 symbol 来区分
 * 比如, TAKE, PUT 等, 都属于 IO symbol (副作用类型)
 */

const createSymbol = (name: string) => `@@redux-saga/${name}`;

// 表示 effect 类型
export const IO = createSymbol('IO');

export const MULTICAST = createSymbol('MULTICAST');

// channel 使用的 match 函数标识 (验证 action.type 和 taker 是否匹配的匹配规则函数)
export const MATCH = createSymbol('MATCH');
