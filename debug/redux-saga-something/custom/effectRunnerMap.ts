/**
 * 处理不同 effect 的方法集合, 单独提取为一个 map 结构
 */

import * as effectTypes from './effects/effectTypes';
import { EnvType } from './runSaga';
import * as is from './is';
import matcher from './matcher';
import { asap } from './scheduler';
import { immediately } from './scheduler';
import proc from './proc';
import { current as currentEffectId } from './uid';

/**
 * 生成子 fork 的执行主体:
 *   fn === generator -> iterator
 *   TODO -> 其他类型
 */
function createTaskIterator({ context, fn, args }) {
  try {
    const result = fn.apply(context, args);

    // 暂时只支持 fn === generator 的情况
    if (is.iterator(result)) {
      return result;
    }
  } catch (err) {
    //  TODO
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

function runTakeEffect(
  env: EnvType,
  { channel = env.channel, pattern }: any,
  cb: Function
) {
  const takeCb = (input?: unknown) => {
    cb(input);
  };
  try {
    /**
     * 在订阅函数上面, 挂载一个 matcher, 用来再确认是否和当前 Action 匹配时调用,
     * 这里的 matcher(pattern) 就是生成匹配函数的地方
     * 最终会得到类似于:
     *   (pattern: take的原始值) => (action: 当前派发过来的action) => { .... // 自定义逻辑, 返回是是否匹配 }
     */
    channel.take(takeCb, is.notUndef(pattern) ? matcher(pattern) : null);
  } catch (err) {
    cb(err, true);
    return;
  }
  //   cb.cancel = takeCb.cancel;
}

function runPutEffect(env: EnvType, { channel, action }: any, cb: Function) {
  asap(() => {
    let result;
    try {
      // TODO 开发中没有使用过, channel 存在的情况, 这里先标记一下
      result = (channel ? channel.put : env.dispatch)(action);
    } catch (error) {
      cb(error, true);
      return;
    }
    cb(result); // Put effects are non cancellables
  });
}

function runForkEffect(
  env: EnvType,
  { context, fn, args, detached }: any, // fork 的指定 effect 格式
  cb: Function,
  { task: parent }: any
) {
  const taskIterator = createTaskIterator({ context, fn, args });

  immediately(() => {
    /**
     * 直接从全局变量读取 currentEffectId, 因为 fork 一定是从父 saga 得到的
     * detached 为真时, 由于 spawn 出来的子 saga 和父进程没有决议上的联系, 所以他本省就是一个根 saga
     */
    const child = proc(env, taskIterator, currentEffectId, detached);

    // TODO 暂时不处理 detached 的情况, fork -> attached; spawn -> detached
    if (child.isRunning()) {
      parent.queue.addTask(child);
      cb(child);
    } else if (child.isAborted()) {
      parent.queue.abort(child.error());
    } else {
      cb(child);
    }
  });
  // Fork effects are non cancellables
}

const effectRunnerMap = {
  [effectTypes.TAKE]: runTakeEffect,
  [effectTypes.PUT]: runPutEffect,
  [effectTypes.FORK]: runForkEffect,
};

export default effectRunnerMap;
