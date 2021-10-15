import React, { ForwardRefRenderFunction, ComponentClass, FC, useMemo } from 'react';

import { FormInstance } from './interface';
import useForm from './useForm';
import FieldContext from './FieldContext';

/**
 * Form 组件的 props
 * form, formStore 数据实例
 * component, 自定义 form render, 默认是原生 form 组件
 *
 *
 */
export interface FormProps<Values = any> {
  form?: FormInstance<Values>;
  component?: string | FC<any> | ComponentClass<any>;
}

/**
 * ForwardRefRenderFunction
 *
 */
const Form: ForwardRefRenderFunction<FormInstance, FormProps> = ({
  form,
  component: Component = 'form',
  children,
  ...restProps
}) =>
  // ref,
  {
    const [formInstance] = useForm(form);

    // Prepare children by `children` type
    const childrenNode = children;

    // formStore 全局状态
    const formContextValue = useMemo(() => ({ ...formInstance }), [formInstance]);

    const wrapperNode = (
      <FieldContext.Provider value={formContextValue}>{childrenNode}</FieldContext.Provider>
    );

    return <Component {...restProps}>{wrapperNode}</Component>;
  };

export default Form;
