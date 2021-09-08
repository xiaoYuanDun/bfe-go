import { EnvType } from './runSaga';
import { TASK_STATUS } from './task-status';
import { TASK, TASK_CANCEL } from './symbols';
import forkQueue from './forkQueue';
import { noop } from './utils';

export type MainTaskSharp = {
  status: TASK_STATUS;
  cancel: Function;
};

export type TaskSharp = {
  id: number;
  isRoot: boolean;
  queue: any;
  isRunning: Function;
  isAborted: Function;
  cont: Function;
  cancel: Function;
};

export default function newTask(
  env: EnvType,
  mainTask: MainTaskSharp,
  parentEffectId: number,
  isRoot: boolean,
  cont = noop
) {
  let status = TASK_STATUS.RUNNING;
  let taskResult;
  // let taskError;

  const queue = forkQueue(
    mainTask,
    function onAbort() {
      // cancelledDueToErrorTasks.push(...queue.getTasks().map(t => t.meta.name))
    },
    end
  );

  /**
   * 结束当前任务, '取消' 动作会向当前 task(parentTask) 的整个执行上下文传递
   * 对于已经 terminated 或 已经取消的任务来说, '取消' 不做任何动作
   *
   * 因为 queue 是一个 task 组成的队列, queue.cancelAll() 内部会调用每个 task 的 cancel
   * 这样就形成了向下的递归调用, 知道整个调用栈的 task 全部都 cancel
   */
  function cancel() {
    if (status === TASK_STATUS.RUNNING) {
      status = TASK_STATUS.CANCELLED;
      queue.cancelAll();
      end(TASK_CANCEL, false);
    }
  }

  function end(result: any, isErr: boolean) {
    // 这时 task 的状态有可能是: RUNNING / CANCELLED
    // TODO 这里感觉没啥意义啊, 如果 result === TASK_CANCEL, 说明一定是 cancel 触发的, 在这之前 status 已经被设置为 CANCELLED 了
    if (!isErr) {
      if (result === TASK_CANCEL) {
        status = TASK_STATUS.CANCELLED;
      }
      taskResult = result;
    }

    // TODO 这里默认应该是个空函数, 没有实际意义
    task.cont(result, isErr);
  }

  const task: TaskSharp = {
    [TASK]: true,
    id: parentEffectId,
    // meta,
    isRoot,
    // context,
    // joiners: [],
    queue,

    // // methods
    cancel,
    cont,
    // end,
    // setContext,
    // toPromise,
    isRunning: () => status === TASK_STATUS.RUNNING,
    /*
      This method is used both for answering the cancellation status of the task and answering for CANCELLED effects.
      In most cases, the cancellation of a task propagates to all its unfinished children (including
      all forked tasks and the mainTask), so a naive implementation of this method would be:
        `() => status === CANCELLED || mainTask.status === CANCELLED`

      But there are cases that the task is aborted by an error and the abortion caused the mainTask to be cancelled.
      In such cases, the task is supposed to be aborted rather than cancelled, however the above naive implementation
      would return true for `task.isCancelled()`. So we need make sure that the task is running before accessing
      mainTask.status.

      There are cases that the task is cancelled when the mainTask is done (the task is waiting for forked children
      when cancellation occurs). In such cases, you may wonder `yield io.cancelled()` would return true because
      `status === CANCELLED` holds, and which is wrong. However, after the mainTask is done, the iterator cannot yield
      any further effects, so we can ignore such cases.

      See discussions in #1704
     */
    // isCancelled: () => status === CANCELLED || (status === RUNNING && mainTask.status === CANCELLED),
    isAborted: () => status === TASK_STATUS.ABORTED,
    // result: () => taskResult,
    // error: () => taskError,
  };

  return task;
}
