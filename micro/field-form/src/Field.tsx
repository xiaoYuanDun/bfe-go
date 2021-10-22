import React, { useContext, FC, Component } from 'react';

import FieldContext, { HOOK_MARK } from './FieldContext';
import { InternalFormInstance, NamePath, InternalNamePath } from './interface';
import { getNamePath } from './utils/valueUtil';

// 内部 Field/ClassComponent 的 props
export interface InternalFieldProps<Values = any> {
  fieldContext?: InternalFormInstance;
  name?: InternalNamePath;
  initialValue?: any;
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

// 这里规定了 Field 必须实现的属性
export interface FieldEntity {}

export interface FieldState {
  //   resetCount: number;
}

class Field extends Component<InternalFieldProps, FieldState> implements FieldEntity {
  //   public static contextType = FieldContext;

  private mounted = false;

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

    // One more render for component in case fields not ready
    if (shouldUpdate === true) {
      this.reRender();
    }
  }

  // ================================== Utils ==================================
  public getNamePath = (): InternalNamePath => {
    const { name, fieldContext } = this.props;
    const { prefixName = [] }: InternalFormInstance = fieldContext; // prefixName 是 List 传递过来的, 暂时不考虑

    return name !== undefined ? [...prefixName, ...name] : [];
  };

  render() {
    const { children } = this.props;
    return <React.Fragment>{children} </React.Fragment>;
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
