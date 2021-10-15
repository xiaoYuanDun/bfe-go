import React, { forwardRef, PropsWithChildren, Ref } from 'react';

import { FormInstance } from './interface';
import FieldForm, { FormProps } from './Form';
import useForm from './useForm';
import Field from './Field';

/**
 * 这里 FieldForm 被一个 forwardRef 包裹, 所以 FieldForm 的形式一定是 (props, ref) => ReactNode 的形式
 * 查看 forwardRef 可以知道, 他是一个 ForwardRefRenderFunction 格式的方法, 他本身可以看成是一个 'render'
 *
 * interface ForwardRefRenderFunction<T, P = {}> = {
 *   (props: PropsWithChildren<P>, ref: ForwardedRef<T>): ReactElement | null;
 * }
 *
 * 最终得到的是一个函数组件, 该组件的参数中, 必须还有一个 ref 属性
 */
const InternalForm = forwardRef<FormInstance, FormProps>(FieldForm) as <Values = any>(
  props: PropsWithChildren<FormProps<Values>> & { ref?: Ref<FormInstance<Values>> },
) => React.ReactElement;

/**
 * 这里源码中的对于类型的处理办法是 和属性同名: InternalForm, RefForm
 * 个人觉得这样不是很清晰, 最好还是区分一下, 暂时和源码保持一致
 */
type InternalForm = typeof InternalForm;

interface RefForm extends InternalForm {
  // FormProvider: typeof FormProvider;
  // Field: typeof Field;
  // List: typeof List;
  useForm: typeof useForm;
}

const RefForm = InternalForm as RefForm;

RefForm.useForm = useForm;

export { Field };

export default RefForm;
