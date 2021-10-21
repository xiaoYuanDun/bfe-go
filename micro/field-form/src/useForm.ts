import { useRef, useState } from 'react';
import warning from 'rc-util/lib/warning';

import { HOOK_MARK } from './FieldContext';
import {
  FormInstance,
  InternalFormInstance,
  NamePath,
  FieldEntity,
  InvalidateFieldEntity,
  InternalHooks,
  ValidateMessages,
  Callbacks,
  Store,
} from './interface';

import { setValues } from './valueUtil';

/**
 *  form数据对象的类
 */
class FormStore {
  constructor(forceRootUpdate: () => void) {
    this.forceRootUpdate = forceRootUpdate;
  }

  // formStore 是否调用过 getInternalHooks
  private formHooked: boolean = false;

  private fieldEntities: FieldEntity[] = [];

  private callbacks: Callbacks = {};

  private validateMessages: ValidateMessages = null;

  private preserve?: boolean = null;

  private initialValues: Store = {};

  private store: Store = {};

  private forceRootUpdate: () => void;

  public getForm = (): InternalFormInstance => ({
    getFieldsValue: this.getFieldsValue,
    getInternalHooks: this.getInternalHooks,
  });

  // ======================== Internal Hooks ========================
  private getInternalHooks = (key: string): InternalHooks | null => {
    if (key === HOOK_MARK) {
      this.formHooked = true;

      return {
        // dispatch: this.dispatch,
        // initEntityValue: this.initEntityValue,
        // registerField: this.registerField,
        // useSubscribe: this.useSubscribe,
        setInitialValues: this.setInitialValues,
        setCallbacks: this.setCallbacks,
        setValidateMessages: this.setValidateMessages,
        setPreserve: this.setPreserve,
        // getFields: this.getFields,
        // getInitialValue: this.getInitialValue,
      };
    }

    warning(false, '`getInternalHooks` is internal usage. Should not call directly.');
    return null;
  };

  private setValidateMessages = (validateMessages: ValidateMessages) => {
    this.validateMessages = validateMessages;
  };

  private setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = callbacks;
  };

  private setPreserve = (preserve: boolean) => {
    this.preserve = preserve;
  };

  // 如果当前 formStore mount阶段(第一次执行), 同时对 store 赋值, 注意对 store 的赋值在整个声明周期只会进行一次
  private setInitialValues = (initialValues: Store, init: boolean) => {
    this.initialValues = initialValues || {};
    if (init) {
      this.store = setValues({}, initialValues, this.store);
    }
  };

  // ============================ Fields ============================
  private getFieldsValue = (nameList?: NamePath[] | true) => {
    // this.warningUnhooked();

    // 没有按照数组规范传递 nameList 会被置为 null, 返回全量 formFields 数据
    const fieldEntities = this.getFieldEntitiesForNamePathList(
      Array.isArray(nameList) ? nameList : null,
    );
  };

  private getFieldEntitiesForNamePathList = (
    nameList?: NamePath[],
  ): (FieldEntity | InvalidateFieldEntity)[] => {
    if (!nameList) {
      return this.getFieldEntities(true);
    }
    // const cache = this.getFieldsMap(true);
    // return nameList.map(name => {
    //   const namePath = getNamePath(name);
    //   return cache.get(namePath) || { INVALIDATE_NAME_PATH: getNamePath(name) };
    // });
  };

  // private getFieldEntities = (pure: boolean = false) => {
  //   if (!pure) {
  //     return this.fieldEntities;
  //   }
  //   return this.fieldEntities.filter(field => field.getNamePath().length);
  // };
}

/**
 * form 数据对象在 Form 整个生命周期中只会初始化一次
 * 有传入的 form 就用传入的, 否则新建一个 formStore
 */
function useForm<Values = any>(form?: FormInstance<Values>): [FormInstance<Values>] {
  const formRef = useRef<FormInstance>();

  // 不需要 state, 只需要一个用于强制更新的 render
  const [, forceUpdate] = useState({});

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      // Create a new FormStore if not provided
      const forceReRender = () => {
        forceUpdate({});
      };

      const formStore: FormStore = new FormStore(forceReRender);

      formRef.current = formStore.getForm();
    }
  }

  return [formRef.current];
}

export default useForm;
