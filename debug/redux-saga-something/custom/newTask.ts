import { EnvType } from './runSaga';
import { TASK_STATUS } from './task-status';
import { TASK } from './symbols';

export type TaskSharp = {
  status: TASK_STATUS;
};

export default function newTask(
  env: EnvType,
  mainTask: TaskSharp,
  parentEffectId: number,
  isRoot: boolean
) {
  let status = TASK_STATUS.RUNNING;

  const task = {
    [TASK]: true,
    id: parentEffectId,
    // meta,
    isRoot,
    // context,
    // joiners: [],
    // queue,

    // // methods
    // cancel,
    // cont,
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
