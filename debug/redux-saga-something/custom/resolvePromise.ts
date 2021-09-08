import * as is from './is';
import { CANCEL } from './symbols';

/**
 * 当一个 effect 时的辅助处理函数
 */
export default function resolvePromise(promise: any, cb: any) {
  const cancelPromise = promise[CANCEL];

  //   if (is.func(cancelPromise)) {
  //     cb.cancel = cancelPromise;
  //   }

  promise.then(cb, (error: Error) => {
    cb(error, true); // 第二个参数为真, 表示出错
  });
}
