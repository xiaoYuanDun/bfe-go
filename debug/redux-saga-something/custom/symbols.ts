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

// 通过 newTask 的到的任务对象的标识
export const TASK = createSymbol('TASK');

// delay 有用到, 用于挂载定时器取消函数
export const CANCEL = createSymbol('CANCEL_PROMISE');

// effect/cancel 中取消副作用的标识
export const SELF_CANCELLATION = createSymbol('SELF_CANCELLATION');

// 一个 TASK 因为取消而结束的标识
export const TASK_CANCEL = createSymbol('TASK_CANCEL');
