import React, { MutableRefObject } from "react";

import type { Service, Options, Subscribe } from "./types";

class Fetch<TData, TParams extends any[]> {

	count: number = 0

	constructor(
		public serviceRef: MutableRefObject<Service<TData, TParams>>,
		public options: Options<TData, TParams>,
		public subscribe: Subscribe,
		// public initState: Partial<FetchState<TData, TParams>> = {},
	) {

	}
}

export default Fetch