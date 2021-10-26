import React, { useContext, FC, Component, isValidElement, cloneElement } from 'react';
import toChildrenArray from 'rc-util/lib/Children/toArray';
import warning from 'rc-util/lib/warning';

import FieldContext, { HOOK_MARK } from './FieldContext';
import {
  InternalFormInstance,
  NamePath,
  InternalNamePath,
  FieldEntity,
  FormInstance,
  Store,
  StoreValue,
  EventArgs,
} from './interface';
import { getNamePath, getValue, defaultGetValueFromEvent } from './utils/valueUtil';

// 内部 Field/ClassComponent 的 props
export interface InternalFieldProps<Values = any> {
  fieldContext?: InternalFormInstance;
  name?: InternalNamePath;
  initialValue?: any;
  preserve?: boolean;
  /** @private Passed by Form.List props. Do not use since it will break by path check. */
  isListField?: boolean;
  validateTrigger?: string | string[] | false;
  trigger?: string;
  valuePropName?: string;
  getValueProps?: (value: StoreValue) => object;
  getValueFromEvent?: (...args: EventArgs) => StoreValue;
  normalize?: (value: StoreValue, prevValue: StoreValue, allValues: Store) => StoreValue;
}

// 对外的 WrapperField 的 props
export interface FieldProps<Values = any>
  extends Omit<InternalFieldProps, 'name' | 'fieldContext'> {
  name?: NamePath;

  /**
   * @private Passed by Form.List props. Do not use since it will break by path check.
   * 正常普通的 Field, 这个属性是 undefined
   */
  isListField?: boolean;
}

interface ChildProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;
}

export interface FieldState {
  //   resetCount: number;
}

class Field extends Component<InternalFieldProps, FieldState> implements FieldEntity {
  //   public static contextType = FieldContext;

  public static defaultProps = {
    trigger: 'onChange',
    valuePropName: 'value',
  };

  private mounted = false;

  private cancelRegisterFunc: (
    isListField?: boolean,
    preserve?: boolean,
    namePath?: InternalNamePath,
  ) => void | null = null;

  // ============================== Subscriptions ==============================
  constructor(props: InternalFieldProps) {
    super(props);

    // Register on init, 把 Field 的 key-val 到 store 中
    if (props.fieldContext) {
      const { getInternalHooks }: InternalFormInstance = props.fieldContext;
      const { initEntityValue } = getInternalHooks(HOOK_MARK);

      initEntityValue(this);
    }
  }

  public componentDidMount() {
    const { /*shouldUpdate,*/ fieldContext } = this.props;
    this.mounted = true;
    // Register on init
    if (fieldContext) {
      const { getInternalHooks }: InternalFormInstance = fieldContext;
      const { registerField } = getInternalHooks(HOOK_MARK);
      this.cancelRegisterFunc = registerField(this);
    }
    // TODO
    // One more render for component in case fields not ready
    // if (shouldUpdate === true) {
    //   this.reRender();
    // }
  }

  public cancelRegister = () => {
    const { preserve, isListField, name } = this.props;
    // 调用前, 验证 cancelRegisterFunc 存在性
    if (this.cancelRegisterFunc) {
      this.cancelRegisterFunc(isListField, preserve, getNamePath(name));
    }
    this.cancelRegisterFunc = null;
  };

  public componentWillUnmount() {
    this.cancelRegister();
    // TODO
    // this.triggerMetaEvent(true);
    this.mounted = false;
  }

  // ============================== Field Control ==============================
  public getValue = (store?: Store) => {
    const { getFieldsValue }: FormInstance = this.props.fieldContext;
    const namePath = this.getNamePath();
    return getValue(store || getFieldsValue(true), namePath);
  };

  public getControlled = (childProps: ChildProps = {}) => {
    const {
      validateTrigger,
      fieldContext,
      trigger,
      valuePropName,
      getValueProps,
      getValueFromEvent,
      normalize,
    } = this.props;

    const mergedValidateTrigger =
      validateTrigger !== undefined ? validateTrigger : fieldContext.validateTrigger;
    const namePath = this.getNamePath();
    const { getInternalHooks, getFieldsValue }: InternalFormInstance = fieldContext;
    const { dispatch } = getInternalHooks(HOOK_MARK);
    const value = this.getValue();

    // 用来处理组件值不是 'value' 的组件, 如 Select, 自定义组件等
    const mergedGetValueProps = getValueProps || ((val: StoreValue) => ({ [valuePropName]: val }));

    const originTriggerFunc: any = childProps[trigger];

    const control = {
      ...childProps,
      ...mergedGetValueProps(value),
    };

    // TODO, 逻辑未整理完全
    // Add trigger
    control[trigger] = (...args: EventArgs) => {
      console.log('---');
      let newValue: StoreValue;
      if (getValueFromEvent) {
        newValue = getValueFromEvent(...args);
      } else {
        newValue = defaultGetValueFromEvent(valuePropName, ...args);
      }

      if (normalize) {
        newValue = normalize(newValue, value, getFieldsValue(true));
      }

      dispatch({
        type: 'updateValue',
        namePath,
        value: newValue,
      });

      if (originTriggerFunc) {
        originTriggerFunc(...args);
      }
    };

    return control;
  };

  // ============================= Child Component =============================

  // TODO, renderProps 相关逻辑暂时不看
  public getOnlyChild = (
    children: React.ReactNode,
    // | ((control: ChildProps, meta: Meta, context: FormInstance) => React.ReactNode),
  ): { child: React.ReactNode | null; isFunction: boolean } => {
    // Support render props
    // if (typeof children === 'function') {
    //   const meta = this.getMeta();

    //   return {
    //     ...this.getOnlyChild(children(this.getControlled(), meta, this.props.fieldContext)),
    //     isFunction: true,
    //   };
    // }

    // Filed element only
    const childList = toChildrenArray(children); // 递归的把 children 以及其所有 child 的 children 打平为一个一维数组

    // TODO, 这里的判断没看懂
    if (childList.length !== 1 || !React.isValidElement(childList[0])) {
      return { child: childList, isFunction: false };
    }

    return { child: childList[0], isFunction: false };
  };

  // ================================== Utils ==================================
  public getNamePath = (): InternalNamePath => {
    const { name, fieldContext } = this.props;
    const { prefixName = [] }: InternalFormInstance = fieldContext; // prefixName 是 List 传递过来的, 暂时不考虑

    return name !== undefined ? [...prefixName, ...name] : [];
  };

  render() {
    // TODO, 这里的逻辑还没有复刻完成
    const { children } = this.props;

    const { child, isFunction } = this.getOnlyChild(children);

    let returnChildNode: React.ReactNode;
    if (isFunction) {
      // returnChildNode = child;
    } else if (isValidElement(child)) {
      returnChildNode = cloneElement(child, this.getControlled(child.props));
    } else {
      warning(!child, '`children` of Field is not validate ReactElement.');
      returnChildNode = child;
    }

    return <React.Fragment>{returnChildNode}</React.Fragment>;
  }
}

const WrapperField: FC<FieldProps> = ({ name, ...restProps }) => {
  const fieldContext = useContext(FieldContext);

  const namePath = name !== undefined ? getNamePath(name) : undefined;

  let key: string = 'keep';
  if (!restProps.isListField) {
    key = `_${(namePath || []).join('_')}`;
  }
  // TODO, namePath 需要兼容处理 Form.List 的情况, 这里暂时不处理

  return <Field key={key} name={namePath} {...restProps} fieldContext={fieldContext} />;
};

export default WrapperField;
