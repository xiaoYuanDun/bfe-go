const Link = require('../链表')

class Queue {
	constructor() {
		this.ll = new Link()
	}
	poll() {
		const removeNode = this.ll.remove(0)
		if (removeNode) {
			return removeNode.element
		} else {
			return removeNode
		}
	}
	offer(element) { // 添加
		this.ll.add(element)
	}
}


module.exports = Queue