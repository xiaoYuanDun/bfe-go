import { useEffect, useLayoutEffect, useRef } from 'react';

type effectHookType = typeof useEffect | typeof useLayoutEffect;

type UpdateEffectType = <T extends effectHookType>(hook: T) => T

const aa = () => { }

type AA = typeof aa

type R1 = AA extends effectHookType ? 1 : 2

export const createUpdateEffect: (hooks: effectHookType) => effectHookType =
	// export const createUpdateEffect: (hook: effectHookType) => effectHookType =
	(hook) => (effect, deps) => {
		// const isMounted = useRef(false);

		// // for react-refresh
		// hook(() => {
		// 	return () => {
		// 		isMounted.current = false;
		// 	};
		// }, []);

		// hook(() => {
		// 	if (!isMounted.current) {
		// 		isMounted.current = true;
		// 	} else {
		// 		return effect();
		// 	}
		// }, deps);
	};


export default createUpdateEffect(useEffect);


