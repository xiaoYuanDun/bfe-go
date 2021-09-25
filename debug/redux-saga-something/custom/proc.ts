/**
 *
 * proc 是真正处理 rootSaga 逻辑的地方, 如:
 * 返回 ACTION.TAKE 时要怎么处理
 * 返回 ACTION.PUT 时要怎么处理
 * yield 后又是一个生成器时, 要怎么处理
 * 等等, ......
 */

import { EnvType } from './runSaga';
import nextEffectId from './uid';
import { IO } from './symbols';
import effectRunnerMap from './effectRunnerMap';
import { AllTypeSharp } from './effects/effectTypes';
import { TASK_STATUS } from './task-status';
import newTask, { MainTaskSharp } from './newTask';
import * as is from './is';
import resolvePromise from './resolvePromise';
import { noop, shouldCancel } from './utils';
import { TASK_CANCEL } from './symbols';

function proc(
  env: EnvType,
  iterator: Generator<any>,
  parentEffectId: number,
  isRoot: boolean,
  cont = noop // TODO  不知道他的意义是什么, 会被带入带 task 中, 挂载到每个 task 的 cont 属性上
) {
  // finalizeRunEffect 默认是 v => v, 所以这里得到的 finalRunEffect 实际上就是 runEffect
  const finalRunEffect = env.finalizeRunEffect(runEffect);

  /**
   * 创建一个 '主任务' 用来追踪主流程, 这里暂时省略了 meta 属性
   *
   * status: 初始状态
   * cancel: mainTask 的中断标识, 向 next 发起一个特殊标识 TASK_CANCEL
   */
  const mainTask: MainTaskSharp = {
    status: TASK_STATUS.RUNNING,
    cancel: () => {
      if (mainTask.status === TASK_STATUS.RUNNING) {
        mainTask.status = TASK_STATUS.CANCELLED;
        next(TASK_CANCEL);
      }
    },
  };

  /**
   * 一个 generator 会得到:
   *   一个对应的 iterator 对象(generator())
   *   一个任务描述对象(task)
   *   一个主任务对象(包含在 task 中)
   *
   * 这里是, 给当前的 generator 声称要一个对应的任务描述对象(task), 一个任务描述对象的包含了他的主任务和所有由它 fork 的子任务
   */
  const task = newTask(env, mainTask, parentEffectId, isRoot, cont);

  // 暂存一些执行变量
  const executingContext = { task };

  next();

  // then return the task descriptor to the caller
  return task;

  // ---------------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------

  /**
   * saga 的核心依赖于 生成器, 而 next 方法就是调用每一次 yield 向下执行的关键
   * next 会一直调用直到所有的 yield 都被消费完, 或者手动 return/throws
   * 接受的参数:
   *    正常: (command | effect result, false)
   *    报错: (any thrown thing, true)
   */
  function next(args: any = undefined, isErr?: boolean) {
    let result;
    try {
      if (isErr) {
        // 如果出错, isErr 标识符为 true, 这时的 args 就是错误详情
        result = iterator.throw(args);
      } else if (shouldCancel(args)) {
        // effect.cancel 会使用 TASK_CANCEL 为参数调用 next 方法, 接收到此标识表示需要提前取消 task
        mainTask.status = TASK_STATUS.CANCELLED;

        // TODO 我理解这里是为了处理 在途的promise, 待确定, 这里比较乱
        console.log('next.cancel');
        next.cancel();

        result = is.func(iterator.return)
          ? iterator.return(TASK_CANCEL)
          : { done: true, value: TASK_CANCEL };
      } else {
        result = iterator.next(args);
      }

      // 是否消费完所有的 yield, 没有完就继续向下执行
      if (!result.done) {
        digestEffect(result.value, parentEffectId, next);
      } else {
        // TODO
      }
    } catch (e) {
      // TODO
      console.error(e);
    }
  }

  function digestEffect(effect: any, parentEffectId: number, cb: any) {
    // 为这次任务打上自增标识
    const effectId = nextEffectId();

    function currCb(res?: unknown) {
      // 这个 cb 实际上就是 next 方法
      cb(res);
    }

    /**
     * 注意这里, 每个 副作用(yield 后面接的值), 都需要在自己的 '流程控制回调(这里就是 currCb)' 上面挂载 '取消' 逻辑
     * 当 task itself 或 parent task 被 '取消' 时, 用于取消自身的任务, 并向下传递 '取消操作(cancellation)'
     * 副作用有可能是:
     *   1. 普通副作用(from makeEffect)
     *   2. promise: delay 产生的延时 promise, 在当前任务取消后, 需要被清除, 所以 resolvePromise 中有赋值 cancel function
     */
    currCb.cancel = noop;

    cb.cancel = () => {
      currCb.cancel();
      currCb.cancel = noop;
    };

    finalRunEffect(effect, effectId, currCb);
  }

  function runEffect(effect: any, effectId: number, currCb: Function) {
    if (is.promise(effect)) {
      resolvePromise(effect, currCb);
    } else if (effect && effect[IO]) {
      // 属于官方副作用类型(由 makeEffect 生成的)
      const effectRunner = effectRunnerMap[effect.type as AllTypeSharp];
      effectRunner(env, effect.payload, currCb, executingContext);
    } else {
      // currCb(effect)
    }
  }
}

export default proc;
