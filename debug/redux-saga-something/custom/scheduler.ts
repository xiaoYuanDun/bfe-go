/**
 * 一个带锁的任务流程控制方法
 * 主要暴露了两个方法出去: immediately / asap
 * immediately 会立刻调用任务, 不关心锁的状态, 是否上锁
 * asap 会先入列, 判断锁的状态, 若没有锁定, 则清空任务列表; 否则, 会在造成上锁的任务结束时, 清空任务队列
 */

const queue = [];

// 锁, 标志位
let semaphore = 0;

// 加锁++, 执行任务, 释放锁--
function exec(task) {
  try {
    suspend();
    task();
  } finally {
    release();
  }
}

// 入列, 若没有锁, 加锁++, 执行队列剩下的所有任务
export function asap(task) {
  queue.push(task);

  if (!semaphore) {
    suspend();
    flush();
  }
}

// 上锁++, 立即执行任务, 执行队列剩下的所有任务
// 多个 immediately 有可能同时执行, 因为 immediately 不会判断锁的状态
export function immediately(task) {
  try {
    suspend();
    return task();
  } finally {
    flush();
  }
}

// 上锁++
function suspend() {
  semaphore++;
}

// 释放锁--
function release() {
  semaphore--;
}

// 执行队列所有任务, 每个单独任务执行过程都是: 上锁++, 执行, 释放锁--
// 第一步先释放锁--, flush 都会和 suspend 合用(上锁++)
function flush() {
  release();

  let task;
  while (!semaphore && (task = queue.shift()) !== undefined) {
    exec(task);
  }
}
