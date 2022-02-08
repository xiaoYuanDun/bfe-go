import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useMemoizedFn } from 'ahooks';

import App from './cases/App';

const ele = <App />;

ReactDOM.render(ele, document.getElementById('root'));
