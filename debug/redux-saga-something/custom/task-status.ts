/**
 * 每一次 proc 都会生成一个对应的 task, 每个 task 包含了一些追踪和描述当前 gen 的参数
 * 下面是一个 task 所有可能的状态
 */

export enum TASK_STATUS {
  RUNNING,
  CANCELLED,
  ABORTED,
  DONE,
}

// export const RUNNING = 0;
// export const CANCELLED = 1;
// export const ABORTED = 2;
// export const DONE = 3;
