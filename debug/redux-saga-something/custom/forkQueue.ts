/**
 * forkQueue 队列用来追踪当前任务和其所有的 forks
 * 被 fork 出来的任务, 会默认附加关联在其父任务上
 * saga 使用了 mainTask, parentTask 的方式来构建和描述这种逻辑模型
 * mainTask 是当前生成器的主要流程
 * parentTask 是 mainTask 和他 所有的 forked tasks 的集合
 *
 * parentTask 具有以下特点:
 *   1. parentTask 所有的 forks 全部完成或全部取消, 则 parentTask 执行完毕(这里我觉得使用 'promise 决议' 的概念更贴切)
 *   2. 如果 parentTask 取消, 这 parentTask 所有的 forks 也会被取消
 *   3. 如果 parentTask 的任何 forks 上抛一个错误, 则 parentTask 会被终止
 *   4. 如果 parentTask 执行完成, 则其返回值是它主任务的返回值
 *
 */

import { TaskSharp } from './newTask';
import { noop, remove } from './utils';

export default function forkQueue(mainTask: TaskSharp, onAbort, cont) {
  let tasks = [];
  let result;
  let completed = false;

  addTask(mainTask);

  function addTask(task: any) {
    tasks.push(task);
    // task.cont = (res, isErr) => {
    //   if (completed) {
    //     return;
    //   }

    //   remove(tasks, task);
    //   task.cont = noop;
    //   if (isErr) {
    //     abort(res);
    //   } else {
    //     if (task === mainTask) {
    //       result = res;
    //     }
    //     if (!tasks.length) {
    //       completed = true;
    //       cont(result);
    //     }
    //   }
    // };
  }

  return {
    addTask,
    //     cancelAll,
    //     abort,
    //     getTasks,
  };
}
