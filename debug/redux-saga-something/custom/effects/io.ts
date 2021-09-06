import { Action } from 'redux';
import { IO } from '../symbols';
import * as effectTypes from './effectTypes';
import * as is from '../is';

// 通用的生成特定 action 的方法
const makeEffect = (type: string, payload: unknown) => ({
  [IO]: true,
  type,
  payload,
  // 暂时不知道这个属性的作用
  // combinator: false,
});

/**
 * 这个方法仅用来把不同的入参处理成统一的格式,
 * 因为 fork 方法支持多种写法:
 *   1. fork(fn, ...args)
 *   2. fork([context, fn], ...args)
 *   3. fork({context, fn}, ...args)
 */
function getFnCallDescriptor(fnDescriptor, args) {
  let context = null;
  let fn;

  if (is.func(fnDescriptor)) {
    fn = fnDescriptor;
  } else {
    if (is.array(fnDescriptor)) {
      [context, fn] = fnDescriptor;
    } else {
      ({ context, fn } = fnDescriptor);
    }

    if (context && is.string(fn) && is.func(context[fn])) {
      fn = context[fn];
    }
  }

  return { context, fn, args };
}

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

/**
 * take 的一般用法是: yield take('XXX_ACTION')
 */
const take = (patternOrChannel = '*') => {
  // 首先判断是否为普通的识别模式, 组装固定格式, 这里的 pattern 后面在 channel.put 中回用于校验是否匹配
  if (is.pattern(patternOrChannel)) {
    return makeEffect(effectTypes.TAKE, { pattern: patternOrChannel });
  }
  return null;
};

/**
 * put 的参数有可能是 (action) or (channel, action)
 * 大部分情况下, 只有一个参数, 就是要派发的原始 Action
 * 下面的 if 做了这个判断, 调换了一下参数位置
 */
const put = (channel: any, action?: Action) => {
  if (is.undef(action)) {
    action = channel;
    channel = undefined; // `undefined` instead of `null` to make default parameter work
  }
  return makeEffect(effectTypes.PUT, { channel, action });
};

/**
 * fork 一个子 saga, 不会阻塞当前 saga 执行
 */
const fork = (fnDescriptor, ...args) => {
  return makeEffect(effectTypes.FORK, getFnCallDescriptor(fnDescriptor, args));
};

export { take, put };
