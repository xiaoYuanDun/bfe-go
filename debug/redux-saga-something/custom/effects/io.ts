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

export { take, put };
