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
  InternalNamePath,
  NotifyInfo,
  NamePath,
  Meta,
  InvalidateFieldEntity,
} from './interface';

import {
  setValues,
  getValue,
  setValue,
  getNamePath,
  matchNamePath,
  cloneByNamePathList,
} from './utils/valueUtil';
import NameMap from './utils/NameMap';

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
    getFieldsValue: this.getFieldsValue,
    getInternalHooks: this.getInternalHooks,
    // setFields: this.setFields,
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

  private getFieldValue = (name: NamePath) => {
    this.warningUnhooked();

    const namePath: InternalNamePath = getNamePath(name);
    return getValue(this.store, namePath);
  };

  private getFieldsValue = (nameList?: NamePath[] | true, filterFunc?: (meta: Meta) => boolean) => {
    this.warningUnhooked();

    // TODO, why???
    if (nameList === true && !filterFunc) {
      return this.store;
    }

    // TODO, 这里的逻辑暂时先不看
    // 没有按照数组规范传递 nameList 会被置为 null, 返回全量 formFields 数据
    const fieldEntities = this.getFieldEntitiesForNamePathList(
      Array.isArray(nameList) ? nameList : null,
    );

    const filteredNameList: NamePath[] = [];
    fieldEntities.forEach((entity: FieldEntity | InvalidateFieldEntity) => {
      const namePath =
        'INVALIDATE_NAME_PATH' in entity ? entity.INVALIDATE_NAME_PATH : entity.getNamePath();

      // TODO, List 相关逻辑暂时不看
      // Ignore when it's a list item and not specific the namePath,
      // since parent field is already take in count
      // if (!nameList && (entity as FieldEntity).isListField?.()) {
      //   return;
      // }

      if (!filterFunc) {
        filteredNameList.push(namePath);
      } else {
        // TODO, filterFunc 逻辑暂时不看
        // const meta: Meta = 'getMeta' in entity ? entity.getMeta() : null;
        // if (filterFunc(meta)) {
        //   filteredNameList.push(namePath);
        // }
      }
    });
    /**
     * 最终得到的 filteredNameList 实际上并没有过滤任何不存在的 key
     * 比如, 表单项里只有 ['name', 'age'] 两个表单项, 但是 nameList 却提供了 ['sex', 'money']
     * 最终得到: { sex: undefined, money: undefined }
     * 个人觉得, 不存在的表单项应该直接被过滤, 上面应该返回一个 {} 才对
     *
     * 还有另一个问题:
     * 仅考虑 Field, nameList 类型是 ['xx_0', 'xx_1', ...]
     * 1. 通过 Array.array 做个简单的类型验证和转换
     * 2. getFieldEntitiesForNamePathList, 得到这些 keys 对应的 Field 实体(若不存在, 返回 { INVALIDATE_NAME_PATH: [xx_x] })
     * 3. 然后遍历 nameList, 找到每个 name 对应的 Field, 从 Field 实体中拿到 namePath
     * 最后到的是一个包装过的数组: ['xx_0', 'xx_1', ...] ---> [['xx_0'], ['xx_1'], ...]
     * 个人认为不需要这么复杂的操作, 直接一个 filter + map 就可以解决
     *
     * 暂时不知道是不是为了兼容 List 才这么做, 打个 TODO
     */
    return cloneByNamePathList(this.store, filteredNameList.map(getNamePath));
  };

  private getFieldsMap = (pure: boolean = false) => {
    const cache: NameMap<FieldEntity> = new NameMap();
    this.getFieldEntities(pure).forEach(field => {
      const namePath = field.getNamePath();
      cache.set(namePath, field);
    });
    return cache;
  };

  private getFieldEntitiesForNamePathList = (
    nameList?: NamePath[],
  ): (FieldEntity | InvalidateFieldEntity)[] => {
    if (!nameList) {
      return this.getFieldEntities(true);
    }
    // this.fieldEntities 是使用数组维护 fields, 这里把他转成一个 Map(KV结构)
    const cache = this.getFieldsMap(true);
    return nameList.map(name => {
      const namePath = getNamePath(name);
      return cache.get(namePath) || { INVALIDATE_NAME_PATH: getNamePath(name) };
    });
  };

  private getFieldEntities = (pure: boolean = false) => {
    if (!pure) {
      return this.fieldEntities;
    }
    // TODO, 不知道什么情况下会出现 namePath 数组为空的情况???
    return this.fieldEntities.filter(field => field.getNamePath().length);
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
    // if (this.subscribable) {
    //   const mergedInfo: ValuedNotifyInfo = {
    //     ...info,
    //     store: this.getFieldsValue(true),
    //   };
    //   this.getFieldEntities().forEach(({ onStoreChange }) => {
    //     onStoreChange(prevStore, namePathList, mergedInfo);
    //   });
    // } else {
    //   this.forceRootUpdate();
    // }
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

    // 解除当前表单项的注册绑定, 并且处理对应 value
    return (isListField?: boolean, preserve?: boolean, subNamePath: InternalNamePath = []) => {
      this.fieldEntities = this.fieldEntities.filter(item => item !== entity); // 排除自身

      // Field, Form 都可以设置 preserve, 可以把 Form 层面的看成全局兜底默认值, 在 Field 自身没有特别设置时, 使用全局设置(default: true)
      const mergedPreserve = preserve !== undefined ? preserve : this.preserve;

      // TODO, 其他逻辑暂时不细看
      // 如果删除字段不需要保留已有属性值, 且不是 ListField, 那么要把对应的 value 值为初始值(initialValue / initialValues[xxx])
      if (mergedPreserve === false && (!isListField || subNamePath.length > 1)) {
        const namePath = entity.getNamePath();

        // 从 initialValues 中得到当前表单项的初始值
        const defaultValue = isListField ? undefined : getValue(this.initialValues, namePath);

        if (
          namePath.length && // 是个有效的 key
          this.getFieldValue(namePath) !== defaultValue && // 不等于初始值才有重置的必要
          // 新的 fields 中没有当前 namePath, 表示这个表单项被剔除, 所以: Only reset when no namePath exist
          this.fieldEntities.every(field => !matchNamePath(field.getNamePath(), namePath))
        ) {
          /**
           * setValue 第四个参数为 true 时, 对象层级大于1层且新值为 undefined 时, 这个属性会被删除, 如删除 'age':
           * 处于不同层级, 表现形式也不同
           * { name: 'xiaoMing', age: 17 } ---> { name: 'xiaoMing', age: undefined }
           * { person: { name: 'xiaoMing', age: 17 } } ---> { person: { name: 'xiaoMing' } }
           */
          this.store = setValue(this.store, namePath, defaultValue, true);
        }
      }
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
