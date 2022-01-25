import { useState, useCallback } from "react";

/**
 * 强制刷新一次，两个 {} 的引用地址永远不相同
 */
function useUpdate() {
	const [, setState] = useState({})

	const update = useCallback(() => {
		setState({})
	}, []);

	return update
}

export default useUpdate