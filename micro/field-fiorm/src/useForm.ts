import { useRef, useState } from 'react';
import { FormInstance, InternalFormInstance } from './interface';

class FormStore {
  constructor(forceRootUpdate: () => void) {
    this.forceRootUpdate = forceRootUpdate;
  }

  private forceRootUpdate: () => void;

  public getForm = (): InternalFormInstance => ({});
}

function useForm<Values = any>(form?: FormInstance<Values>): [FormInstance<Values>] {
  const formRef = useRef<FormInstance>();

  // 不需要 state, 只需要一个用于强制更新的 render
  const [, forceUpdate] = useState({});

  /**
   * form 在 Form 整个生命周期中只会初始化一次
   * 有传入的 form 就用传入的, 否则新建一个 formStore
   */
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
