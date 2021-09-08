import { fork } from './effects';
import { takeEveryHelper, takeLatestHelper } from './sagaHelpers';

/**
 *
 * 本质上, takeEvery 就是构建无限循环的 take:
 *
 * yield takeEvery(ACTION_XXX, asyncGenerator)
 *
 * yield fork(function* () {
 *   while(1) {
 *     yield take(ACTION_XXX);
 *     yield fork(asyncGenerator);
 *   }
 * })
 *
 *
 * 关于 生成器, 迭代器, 可迭代对象 的关系
 *
 * 执行生成器, 会得到一个'迭代器'对象, 该对象实现了 '可迭代协议' 和 '迭代器协议', 很少会有对象只实现迭代器协议，而不实现可迭代协议
 *
 *   可迭代协议: 实现了 可迭代协议 的对象被称为 'iterable(可迭代)', 它必须实现一个 '@@iterator' 方法,
 *              可以通过 '[Symbol.iterator]' 属性访问到, 当这个对象需要被迭代时(如 for...of), 会不带
 *              参数的调用 '@@iterator' 方法, 然后使用此方法返回的迭代器获取要迭代的值
 *   迭代器协议: 简单理解, 就是实现一个 next 方法, 会返回 { done, value } 格式的值, 用于标识此迭代器
 *              是否迭代完毕
 *
 * 所有, 迭代器的行为本质(迭代) 就是 next 方法和 { done, value } 的构建
 *
 * 那么除了直接编写一个无限循环的生成器, 还可以使用更底层, 更符合生成器本质的方式来实现, 就是构建自定义的 next 和 返回值来表现'迭代行为'
 *
 */
export function takeEvery(
  patternOrChannel: any,
  worker: Function,
  ...args: any
) {
  return fork(takeEveryHelper, patternOrChannel, worker, ...args);
}

/**
 *
 * yield takeLatest(ACTION_XXX, asyncGenerator)
 *
 * yield fork(function* () {
 *   let lastTask
 *   while(1) {
 *     const task = yield take(ACTION_XXX);
 *     if(lastTask) {
 *       yield cancel(lastTask)
 *     }
 *     lastTask = yield fork(asyncGenerator);
 *   }
 * })
 *
 * 整体思路和普通函数防抖一样, 都是在新派发到来时, 判断一下上次的任务是否还在进行, 是否需要取消
 *
 */
export function takeLatest(
  patternOrChannel: any,
  worker: Function,
  ...args: any
) {
  return fork(takeLatestHelper, patternOrChannel, worker, ...args);
}
