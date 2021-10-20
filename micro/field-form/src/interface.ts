export type InternalNamePath = (string | number)[];
export type NamePath = string | number | InternalNamePath;

/**
 * form 数据实体, 管理当前 form 的全局状态
 * 可以通过 formStore 的实例可以调用一些 Form 层级的方法
 */
export interface FormInstance<Values = any> {}

/**
 * FormStore.getForm 的返回值类型, getForm 最终是返回一个新的 formStore 实例
 * 为什么不直接用 FormInstance 呢? TODO
 */
export interface InternalFormInstance {}
