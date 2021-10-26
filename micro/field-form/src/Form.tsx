import React, {
  ForwardRefRenderFunction,
  ComponentClass,
  FC,
  useMemo,
  useEffect,
  useContext,
  FormHTMLAttributes,
} from 'react';

import { FormInstance, ValidateMessages, Callbacks, FieldData, Store } from './interface';
import useForm from './useForm';
import FieldContext, { HOOK_MARK } from './FieldContext';
import FormContext from './FormContext';
import { isSimilar } from './utils/valueUtil';

type BaseFormProps = FormHTMLAttributes<HTMLFormElement>;
/**
 * Form 组件的 props
 * form, formStore 数据实例
 * component, 自定义 form render, 默认是原生 form 组件
 * validateMessages, 在 form 层面上统一定义错误提示信息
 * preserve, 字段被移除时, 是否保留已存在的字段值
 * initialValues, 初始化值, 只会生效一次
 * fields, 表单域配置, 官方并不推荐使用这种方式, 而是使用 <Field>{...}</Field>
 * validateTrigger, form 层面上统一设置验证触发时机
 *
 */
export interface FormProps<Values = any> extends BaseFormProps, Callbacks {
  form?: FormInstance<Values>;
  component?: false | string | FC<any> | ComponentClass<any>;
  validateMessages?: ValidateMessages;
  preserve?: boolean;
  initialValues?: Store;
  fields?: FieldData[];
  validateTrigger?: string | string[] | false;
}

const Form: ForwardRefRenderFunction<FormInstance, FormProps> = ({
  form,
  component: Component = 'form',
  name,
  validateMessages,
  onValuesChange,
  onFieldsChange,
  onFinish,
  onFinishFailed,
  preserve,
  initialValues,
  fields,
  validateTrigger = 'onChange',
  children,
  ...restProps
}) =>
  // ref,
  {
    /**
     *  formContext 的 4 个初始方法全都是空白占位方法 (triggerFormChange, triggerFormFinish, registerForm, unregisterForm)
     *  在下面的逻辑中, 他们都被使用来进行一些初始化操作, 但其实没有实际意义, 这么做是对外预留 hook ?
     */
    const formContext = useContext(FormContext);

    const [formInstance] = useForm(form);

    // 因为这些属于组件内部变量方法, 所以需要使用特定的key(HOOK_MARK) 来调用 getInternalHooks 得到, 而不是直接挂载到 form 上
    const { setValidateMessages, setCallbacks, setPreserve, setInitialValues, useSubscribe } =
      formInstance.getInternalHooks(HOOK_MARK);

    // Register form into Context
    useEffect(() => {
      formContext.registerForm(name, formInstance);
      return () => {
        formContext.unregisterForm(name);
      };
    }, [formContext, formInstance, name]);

    // 如果用户自己传入了 validateMessages, 会在这里被写入 context
    // Pass props to store
    setValidateMessages({ ...formContext.validateMessages, ...validateMessages });

    // 这里把对外暴露的 hook 方法写入 context, 对于某些 hook 进行一下简单包装
    setCallbacks({
      onValuesChange,
      onFieldsChange: (changedFields: FieldData[], ...rest) => {
        formContext.triggerFormChange(name, changedFields);

        if (onFieldsChange) {
          onFieldsChange(changedFields, ...rest);
        }
      },
      onFinish: (values: Store) => {
        formContext.triggerFormFinish(name, values);

        if (onFinish) {
          onFinish(values);
        }
      },
      onFinishFailed,
    });

    setPreserve(preserve);

    // Set initial value, init store value when first mount
    const mountRef = React.useRef(null);
    setInitialValues(initialValues, !mountRef.current);
    if (!mountRef.current) {
      mountRef.current = true;
    }

    // 检查 children 使用方式, 是否是 'renderProps'
    // 如果是, 从 context 中取出需要想要传递的参数, 用于调用 childrenRender
    const childrenNode = children;
    const childrenRenderProps = typeof children === 'function'; //
    if (childrenRenderProps) {
      // const values = formInstance.getFieldsValue(true);
      // childrenNode = children(values, formInstance);
    }

    // TODO why??
    // Not use subscribe when using render props
    useSubscribe(!childrenRenderProps);

    // Listen if fields provided. We use ref to save prev data here to avoid additional render
    const prevFieldsRef = React.useRef<FieldData[] | undefined>();
    React.useEffect(() => {
      // 浅比较, 前后 fields 对象, 注意这里的 setFields 不是内部hook, 所以是直接从 form 上拿的, 而非通过调用 getInternalHooks 得到
      if (!isSimilar(prevFieldsRef.current || [], fields || [])) {
        formInstance.setFields(fields || []);
      }
      prevFieldsRef.current = fields;
    }, [fields, formInstance]);

    // 把 formStore 和 validateTrigger 包装成一个新的 context, 向下提供
    const formContextValue = useMemo(
      () => ({ ...formInstance, validateTrigger }),
      [formInstance, validateTrigger],
    );

    // 注意这里赋值的是哪一个 context (FieldContext), 这是后面判断 Field 使用是否合法的关键前置步骤
    const wrapperNode = (
      <FieldContext.Provider value={formContextValue}>{childrenNode}</FieldContext.Provider>
    );

    // 这里不是很懂, 如果值为 false, 就不渲染 form 外壳, 那单独渲染出来的表单元素可以正常使用吗?
    if (Component === false) {
      return wrapperNode;
    }

    return <Component {...restProps}>{wrapperNode}</Component>;
  };

export default Form;
