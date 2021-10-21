import { createContext } from 'react';

import { InternalFormInstance } from './interface';

export const HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS';

const Context = createContext<InternalFormInstance>({});

export default Context;
