import { useCreation, useLatest, useUpdate } from "../myHooks";
import Fetch from "./Fetch";

import type { Service, Options, Pulgin } from "./types";

/**
 * 最终要返回数据实体，比如：loading，data 等
 */
function useRequestImplement<TData, TParams extends any[]>(
	service: Service<TData, TParams>,
	options: Options<TData, TParams> = {},
	plugins: Pulgin<TData, TParams>[] = []
) {

	const { manual = false, ...rest } = options;

	// 就是一个浅拷贝
	const fetchOptions = { manual, ...rest }
	// TODO，这里需要用 useLatest 吗？直接使用 service 不就可以保证每次都能拿到最新的 service
	const serviceRef = useLatest(service)
	// 一个强制刷新器
	const update = useUpdate()

	// 这是维护请求整个生命周期的数据变化的核心对象
	const fetchInstance = useCreation(() => {
		const initState = plugins.map((p) => p?.onInit?.(fetchOptions)).filter(Boolean);

		return new Fetch<TData, TParams>(
			serviceRef,
			fetchOptions,
			update,
			// { ...initState }
		);
	}, []);


	return {
		// loading,
		// data
	}
}

export default useRequestImplement