import fsmIterator, { safeName } from './fsmIterator';
import { cancel, take, fork } from '../effects';

export default function takeLatest(
  patternOrChannel: any,
  worker: Function,
  ...args: any
) {
  const yTake = { done: false, value: take(patternOrChannel) };
  const yFork = (ac: any) => ({
    done: false,
    value: fork(worker, ...args, ac),
  });
  const yCancel = (task: any) => ({ done: false, value: cancel(task) });

  let task: any;
  let action: any;
  const setTask = (t: any) => (task = t);
  const setAction = (ac: any) => (action = ac);

  return fsmIterator(
    {
      q1() {
        return { nextState: 'q2', effect: yTake, stateUpdater: setAction };
      },
      q2() {
        return task
          ? { nextState: 'q3', effect: yCancel(task) }
          : { nextState: 'q1', effect: yFork(action), stateUpdater: setTask };
      },
      q3() {
        return {
          nextState: 'q1',
          effect: yFork(action),
          stateUpdater: setTask,
        };
      },
    },
    'q1',
    `takeLatest(${safeName(patternOrChannel)}, ${worker.name})`
  );
}
