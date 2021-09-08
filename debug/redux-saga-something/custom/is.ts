/**
 * 类型判断工具方法集合
 */

export const notUndef = (v: any) => v !== null && v !== undefined;

export const undef = (v: any) => v === null || v === undefined;

export const string = (s: any) => typeof s === 'string';

export const func = (f: any) => typeof f === 'function';

export const array = Array.isArray;

export const iterator = (it: any) => it && func(it.next) && func(it.throw);

export const promise = (p: any) => p && func(p.then);

export const stringableFunc = (f: any) =>
  func(f) && f.hasOwnProperty('toString');

export const symbol = (sym: any) =>
  Boolean(sym) &&
  typeof Symbol === 'function' &&
  sym.constructor === Symbol &&
  sym !== Symbol.prototype;

export const pattern = (pat: any): any =>
  pat &&
  (string(pat) ||
    symbol(pat) ||
    func(pat) ||
    (array(pat) && pat.every(pattern)));

export const channel = (ch: any) => ch && func(ch.take) && func(ch.close);

// import { TASK, MULTICAST, IO, SAGA_ACTION } from '@redux-saga/symbols'

// export const number = n => typeof n === 'number'

// export const object = obj => obj && !array(obj) && typeof obj === 'object'

// export const iterable = it => (it && func(Symbol) ? func(it[Symbol.iterator]) : array(it))
// export const task = t => t && t[TASK]
// export const sagaAction = a => Boolean(a && a[SAGA_ACTION])
// export const observable = ob => ob && func(ob.subscribe)
// export const buffer = buf => buf && func(buf.isEmpty) && func(buf.take) && func(buf.put)

// export const multicast = ch => channel(ch) && ch[MULTICAST]
// export const effect = eff => eff && eff[IO]
