import React, { useContext, FC, Component } from 'react';

import FieldContext from './FieldContext';
import { InternalFormInstance, NamePath, InternalNamePath } from './interface';
import { getNamePath } from './utils/valueUtil';

// 内部 Field/ClassComponent 的 props
export interface InternalFieldProps<Values = any> {
  fieldContext?: InternalFormInstance;
  name?: InternalNamePath;
}

// 对外的 WrapperField 的 props
export interface FieldProps<Values = any> {
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

  constructor(props: InternalFieldProps) {
    super(props);
    console.log('field construsted ....');
  }

  // Only return validate child node. If invalidate, will do nothing about field.
  public getOnlyChild = (
    children: React.ReactNode,
    //   | ((control: ChildProps, meta: Meta, context: FormInstance) => React.ReactNode),
  ): { child: React.ReactNode | null; isFunction: boolean } => {
    // Support render props
    if (typeof children === 'function') {
      const meta = this.getMeta();

      return {
        ...this.getOnlyChild(children(this.getControlled(), meta, this.props.fieldContext)),
        isFunction: true,
      };
    }

    // Filed element only
    const childList = toChildrenArray(children);
    if (childList.length !== 1 || !React.isValidElement(childList[0])) {
      return { child: childList, isFunction: false };
    }

    return { child: childList[0], isFunction: false };
  };

  render() {
    const { children } = this.props;
    return <React.Fragment>{children} </React.Fragment>;
  }
}

const WrapperField: FC<FieldProps> = ({ name, ...restProps }) => {
  const fieldContext = useContext(FieldContext);

  const namePath = name !== undefined ? getNamePath(name) : undefined;

  // 不知道, 这里 key 的默认值为什么是 'keep'
  let key: string = 'keep';
  if (!restProps.isListField) {
    key = `_${(namePath || []).join('_')}`;
  }
  // TODO, namePath 需要兼容处理 Form.List 的情况, 这里暂时不处理

  console.log('fieldContext', fieldContext);

  return <Field key={key} name={namePath} {...restProps} fieldContext={fieldContext} />;
};

export default WrapperField;
