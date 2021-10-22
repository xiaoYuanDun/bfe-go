import { useRef, useState } from 'react';
import warning from 'rc-util/lib/warning';

import { HOOK_MARK } from './FieldContext';
import {
  FormInstance,
  InternalFormInstance,
  FieldEntity,
  InternalHooks,
  ValidateMessages,
  Callbacks,
  Store,
  FieldData,
  InternalNamePath,
  NotifyInfo,
  ValuedNotifyInfo,
  NamePath,
  Meta,
} from './interface';

import { setValues, getValue, setValue, getNamePath } from './utils/valueUtil';

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

  private subscribable: boolean = true;

  private validateMessages: ValidateMessages = null;

  private preserve?: boolean = null;

  private initialValues: Store = {};

  private store: Store = {};

  private forceRootUpdate: () => void;

  public getForm = (): InternalFormInstance => ({
    // getFieldsValue: this.getFieldsValue,
    getInternalHooks: this.getInternalHooks,
    setFields: this.setFields,
  });

  // ======================== Internal Hooks ========================
  private getInternalHooks = (key: string): InternalHooks | null => {
    if (key === HOOK_MARK) {
      this.formHooked = true;

      return {
        // dispatch: this.dispatch,
        initEntityValue: this.initEntityValue,
        registerField: this.registerField,
        useSubscribe: this.useSubscribe,
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

  private useSubscribe = (subscribable: boolean) => {
    this.subscribable = subscribable;
  };

  // 如果当前 formStore mount阶段(第一次执行), 同时对 store 赋值, 注意对 store 的赋值在整个声明周期只会进行一次
  private setInitialValues = (initialValues: Store, init: boolean) => {
    this.initialValues = initialValues || {};
    if (init) {
      this.store = setValues({}, initialValues, this.store);
    }
  };

  /**
   * ========================== Dev Warning =========================
   * 之前开发是经常会遇到这个报错
   * 先明确一点, form 数据对象绑定到 Form 组件是发生在 Form 组件初始化的时候, 通过关键字 formHooked 来判定
   * 因为我们如果在外部使用 useForm 生成一个 form 数据对象, 那么拿到 form 我们就可以调用上面暴露的各种方法
   * 但这时如果 Form 由于某些原因还没有进行渲染(包裹在 Modal 中, 且处于未显示状态)
   * 那么我们调用 form 上的一些 API 时, 就会发现 form 目前没有和任何 Form 组件绑定(formHooked === false)
   */
  private timeoutId: any = null;
  private warningUnhooked = () => {
    if (process.env.NODE_ENV !== 'production' && !this.timeoutId && typeof window !== 'undefined') {
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;

        if (!this.formHooked) {
          warning(
            false,
            'Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?',
          );
        }
      });
    }
  };

  // ============================ Fields ============================
  // private setFields = (fields: FieldData[]) => {
  //   this.warningUnhooked();

  //   const prevStore = this.store;

  //   fields.forEach((fieldData: FieldData) => {
  //     const { name, errors, ...data } = fieldData;
  //     const namePath = getNamePath(name);

  //     // Value
  //     if ('value' in data) {
  //       this.store = setValue(this.store, namePath, data.value);
  //     }

  //     this.notifyObservers(prevStore, [namePath], {
  //       type: 'setField',
  //       data: fieldData,
  //     });
  //   });
  // };

  private getFieldsValue = (nameList?: NamePath[] | true, filterFunc?: (meta: Meta) => boolean) => {
    this.warningUnhooked();

    // TODO, why???
    if (nameList === true && !filterFunc) {
      return this.store;
    }

    // TODO, 这里的逻辑暂时先不看
    // // 没有按照数组规范传递 nameList 会被置为 null, 返回全量 formFields 数据
    // const fieldEntities = this.getFieldEntitiesForNamePathList(
    //   Array.isArray(nameList) ? nameList : null,
    // );

    // const filteredNameList: NamePath[] = [];
    // fieldEntities.forEach((entity: FieldEntity | InvalidateFieldEntity) => {
    //   const namePath =
    //     'INVALIDATE_NAME_PATH' in entity ? entity.INVALIDATE_NAME_PATH : entity.getNamePath();

    //   // Ignore when it's a list item and not specific the namePath,
    //   // since parent field is already take in count
    //   if (!nameList && (entity as FieldEntity).isListField?.()) {
    //     return;
    //   }

    //   if (!filterFunc) {
    //     filteredNameList.push(namePath);
    //   } else {
    //     const meta: Meta = 'getMeta' in entity ? entity.getMeta() : null;
    //     if (filterFunc(meta)) {
    //       filteredNameList.push(namePath);
    //     }
    //   }
    // });

    // return cloneByNamePathList(this.store, filteredNameList.map(getNamePath));
  };

  // private getFieldEntitiesForNamePathList = (
  //   nameList?: NamePath[],
  // ): (FieldEntity | InvalidateFieldEntity)[] => {
  //   if (!nameList) {
  //     return this.getFieldEntities(true);
  //   }
  //   // const cache = this.getFieldsMap(true);
  //   // return nameList.map(name => {
  //   //   const namePath = getNamePath(name);
  //   //   return cache.get(namePath) || { INVALIDATE_NAME_PATH: getNamePath(name) };
  //   // });
  // };

  private getFieldEntities = (pure: boolean = false) => {
    if (!pure) {
      return this.fieldEntities;
    }
    // return this.fieldEntities.filter(field => field.getNamePath().length);
  };

  // =========================== Observer ===========================
  /**
   * This only trigger when a field is on constructor to avoid we get initialValue too late
   * Field 可以携带自己的 initialValue 参数, 如果有, 会在这里被写入到 store 内
   */
  private initEntityValue = (entity: FieldEntity) => {
    const { initialValue } = entity.props;

    if (initialValue !== undefined) {
      const namePath = entity.getNamePath();
      const prevValue = getValue(this.store, namePath);

      if (prevValue === undefined) {
        this.store = setValue(this.store, namePath, initialValue);
      }
    }
  };

  private notifyObservers = (
    prevStore: Store,
    namePathList: InternalNamePath[] | null,
    info: NotifyInfo,
  ) => {
    // TODO, subscribable 的意义是?? 只知道 children 是 renderProps 模式时, subscribable 为 false
    if (this.subscribable) {
      const mergedInfo: ValuedNotifyInfo = {
        ...info,
        store: this.getFieldsValue(true),
      };
      this.getFieldEntities().forEach(({ onStoreChange }) => {
        onStoreChange(prevStore, namePathList, mergedInfo);
      });
    } else {
      this.forceRootUpdate();
    }
  };

  private registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);

    // TODO, 暂时先不看在 Field 中设置初始值的逻辑
    // Set initial values
    if (entity.props.initialValue !== undefined) {
      //   const prevStore = this.store;
      //   this.resetWithFieldInitialValue({ entities: [entity], skipExist: true });
      //   this.notifyObservers(prevStore, [entity.getNamePath()], {
      //     type: 'valueUpdate',
      //     source: 'internal',
      //   });
    }

    return () => {
      console.log('un-register', entity.getNamePath);
    };
  };
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
