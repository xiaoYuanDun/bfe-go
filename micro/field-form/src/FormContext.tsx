import { createContext } from 'react';

import { FormInstance, ValidateMessages, FieldData, Store } from './interface';

/**
 *  这里关于区分 FormProviderProps, FormContextProps 的意义不是很明了, 感觉可以直接合在一起
 *  因为感觉都属于共享方法, 不好确定哪些更base,
 */
export interface FormProviderProps {
  validateMessages?: ValidateMessages;
}

export interface FormContextProps extends FormProviderProps {
  triggerFormChange: (name: string, changedFields: FieldData[]) => void;
  triggerFormFinish: (name: string, values: Store) => void;
  registerForm: (name: string, form: FormInstance) => void;
  unregisterForm: (name: string) => void;
}

const FormContext = createContext<FormContextProps>({
  triggerFormChange: () => {},
  triggerFormFinish: () => {},
  registerForm: () => {},
  unregisterForm: () => {},
});

export default FormContext;
