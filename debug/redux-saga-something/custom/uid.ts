/**
 * 一个很简单的自增表示, 给每一次操作标识顺序序号
 */

export let current = 0;

export default () => ++current;
