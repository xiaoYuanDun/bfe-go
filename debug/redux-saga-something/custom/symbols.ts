/**
 * redux-saga 库中对于不同类型的 ACTION, 使用不同的 symbol 来区分
 * 比如, TAKE, PUT 等, 都属于 IO symbol
 */

const createSymbol = (name: string) => `@@redux-saga/${name}`;

export const IO = createSymbol('IO');

export const MULTICAST = createSymbol('MULTICAST');
