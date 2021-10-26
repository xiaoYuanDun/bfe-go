export type InternalNamePath = (string | number)[];
export type NamePath = string | number | InternalNamePath;

export type StoreValue = any;
export type Store = Record<string, StoreValue>;

export type EventArgs = any[];

// ======================== form 数据实体 ========================
/**
 * form 数据实体, 管理当前 form 的全局状态
 * 可以通过 formStore 的实例可以调用一些 Form 层级的方法
 * originAPI:
 *   getFieldsValue, 返回 form 中所有表单值
 *
 */
export interface FormInstance<Values = any> {
  getFieldsValue(): Values;
  getFieldsValue(nameList: NamePath[] | true, filterFunc?: (meta: Meta) => boolean);

  // 加入了常量 HOOK_MARK 用于忽略用户误操作, 因为它属于内部方法, 不对外暴露
  getInternalHooks: (secret: string) => InternalHooks | null;

  // setFields: (fields: FieldData[]) => void;
}

/**
 * FormStore.getForm 的返回值类型, getForm 最终是返回一个新的 formStore 实例
 * 为什么不直接用 FormInstance 呢? TODO
 */
export type InternalFormInstance = Omit<FormInstance, ''> & {
  /**
   * Passed by field context props
   * 只在 List 中被初始化
   */
  prefixName?: InternalNamePath;

  validateTrigger?: string | string[] | false;
};

interface UpdateAction {
  type: 'updateValue';
  namePath: InternalNamePath;
  value: StoreValue;
}

interface ValidateAction {
  type: 'validateField';
  namePath: InternalNamePath;
  triggerName: string;
}

export type ReducerAction = UpdateAction | ValidateAction;

// ======================== Field ========================
export interface FieldEntity {
  getNamePath: () => InternalNamePath;
  props: {
    name?: NamePath;
    // rules?: Rule[];
    // dependencies?: NamePath[];
    initialValue?: any;
  };
  // onStoreChange: (
  //   store: Store,
  //   namePathList: InternalNamePath[] | null,
  //   info: ValuedNotifyInfo,
  // ) => void;
}

export type InvalidateFieldEntity = { INVALIDATE_NAME_PATH: InternalNamePath };

export interface Meta {
  touched: boolean;
  validating: boolean;
  errors: string[];
  warnings: string[];
  name: InternalNamePath;
}

export interface InternalFieldData extends Meta {
  value: StoreValue;
}

export interface FieldData extends Partial<Omit<InternalFieldData, 'name'>> {
  name: NamePath;
}

// ======================== Internal Hooks ========================
export interface InternalHooks {
  setValidateMessages: (validateMessages: ValidateMessages) => void;
  setCallbacks: (callbacks: Callbacks) => void;
  setPreserve: (preserve: boolean) => void;
  setInitialValues: (initialValues: Store, init: boolean) => void;
  useSubscribe: (subscribable: boolean) => void;
  initEntityValue: (entity: FieldEntity) => void;
  registerField: (entity: FieldEntity) => () => void;
  dispatch: (action: ReducerAction) => void;
}

export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}

// ======================== Validate ========================
export interface ValidateMessages {}

export interface ValidateErrorEntity<Values = any> {
  values: Values;
  errorFields: { name: InternalNamePath; errors: string[] }[];
  outOfDate: boolean;
}

// ======================== Info ========================
// TODO, info 使用意义没看明白
interface ValueUpdateInfo {
  type: 'valueUpdate';
  source: 'internal' | 'external';
}

interface ValidateFinishInfo {
  type: 'validateFinish';
}

interface ResetInfo {
  type: 'reset';
}

interface SetFieldInfo {
  type: 'setField';
  data: FieldData;
}

interface DependenciesUpdateInfo {
  type: 'dependenciesUpdate';
  /**
   * Contains all the related `InternalNamePath[]`.
   * a <- b <- c : change `a`
   * relatedFields=[a, b, c]
   */
  relatedFields: InternalNamePath[];
}

export type NotifyInfo = SetFieldInfo;
// | ValueUpdateInfo
// | ValidateFinishInfo
// | ResetInfo
// | DependenciesUpdateInfo;

export type ValuedNotifyInfo = NotifyInfo & {
  store: Store;
};
