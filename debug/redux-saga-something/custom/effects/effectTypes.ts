/**
 * 特定 ACTION 中的 type 常量
 */

const TAKE = 'TAKE' as const;
const PUT = 'PUT' as const;
const FORK = 'FORK' as const;
const CANCEL = 'CANCEL' as const;

const ALL_TYPE = [TAKE, PUT, FORK, CANCEL];

export type AllTypeSharp = typeof ALL_TYPE[number];

export { TAKE, PUT, FORK, CANCEL };
