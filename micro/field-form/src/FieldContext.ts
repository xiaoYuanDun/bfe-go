import { createContext } from 'react';
import warning from 'rc-util/lib/warning';

import { InternalFormInstance } from './interface';

export const HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS';

const warningFunc: any = () => {
  warning(false, 'Can not find FormContext. Please make sure you wrap Field under Form.');
};

/**
 * 这里是默认的警告方法, 所以对外暴露的 API 方法都被挂载一个警告方法
 * 只有在正确使用 Form 包裹 Field, 并且 Form 正常初始化时, 才会用正确的方法替换这些默认引用
 */
const Context = createContext<InternalFormInstance>({
  getFieldsValue: warningFunc,
  setFields: warningFunc,

  getInternalHooks: () => {
    warningFunc();

    return {
      setValidateMessages: warningFunc,
      setCallbacks: warningFunc,
      setPreserve: warningFunc,
      setInitialValues: warningFunc,
      useSubscribe: warningFunc,
      initEntityValue: warningFunc,
    };
  },
});

export default Context;
