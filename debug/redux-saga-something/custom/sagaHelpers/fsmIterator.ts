/**
 * 配合 takeEvery, 构建一个实现了 '迭代器协议' 的对象
 */

import { makeIterator } from '../utils';
import * as is from '../is';

export default function fsmIterator(
  fsm: any, // { q1: Function; q2: Function, q3: Function }
  startState: any, // 'q1' | 'q2' | 'q3' | {},
  name: string
) {
  let stateUpdater: any;
  let errorState: any;
  let effect;
  let nextState: any = startState;

  function next(arg: any, error: any) {
    // 全部遍历完毕
    if (nextState === qEnd) {
      return done(arg);
    }

    if (error && !errorState) {
      nextState = qEnd;
      throw error;
    } else {
      stateUpdater && stateUpdater(arg);

      const currentState = error ? fsm[errorState](error) : fsm[nextState]();

      ({ nextState, effect, stateUpdater, errorState } = currentState);

      return nextState === qEnd ? done(arg) : effect;
    }
  }

  return makeIterator(next, (error: Error) => next(null, error), name);
}

const done = (value: any) => ({ done: true, value });

export const qEnd = {};

/**
 * patternOrChannel 合法性校验
 */
export function safeName(patternOrChannel: any) {
  if (is.channel(patternOrChannel)) {
    return 'channel';
  }

  if (is.stringableFunc(patternOrChannel)) {
    return String(patternOrChannel);
  }

  if (is.func(patternOrChannel)) {
    return patternOrChannel.name;
  }

  return String(patternOrChannel);
}
