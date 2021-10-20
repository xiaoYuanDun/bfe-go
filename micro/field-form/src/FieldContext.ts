import { createContext } from 'react';

import { InternalFormInstance } from './interface';

const Context = createContext<InternalFormInstance>({
  isField: 1,
});

export default Context;
