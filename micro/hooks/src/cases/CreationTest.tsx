import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useCreation } from "../myHooks";

class Sub {
	constructor() {
		this.name = 'xiaoMing'
		console.log('constructor')
	}
}

function CreationTest(props: any) {

	const [count, setCount] = useState(0)

	const memoRef = useRef(new Sub())
	// const memoRef = useMemo(() => new Sub(), [])

	const memoData = useCreation(() => {
		console.log('go once ...')
		return { name: 'x' }
	}, [])



	return <div>
		<button onClick={() => setCount(count + 1)}>click me</button>
		<br />
		<p>count: {count}</p>
	</div>;
}

export default CreationTest;
