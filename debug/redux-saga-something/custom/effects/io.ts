import { Action } from 'redux';
import { IO } from '../symbols';
import * as effectTypes from './effectTypes';

// 通用的生成特定 action 的方法
const makeEffect = (type: string, payload: unknown) => ({
  [IO]: true,
  type,
  payload,
  // 暂时不知道这个属性的作用
  // combinator: false,
});

// TODO patternOrChannel 意义
// export function take(patternOrChannel = '*', multicastPattern) {
const take = (actionType: string) => makeEffect(effectTypes.TAKE, actionType);

const put = (action: Action) => makeEffect(effectTypes.PUT, action);

export { take, put };
