class Node {
	constructor(element, next) {
		this.element = element
		this.next = next
	}
}

class Link {
	constructor() {
		this.head = null
		this.size = 0
	}
	_node(index) {
		let current = this.head
		for (let i = 0; i < index; i++) {
			current = current.next
		}
		return current
	}
	add(index, element) {
		if (arguments.length === 1) {
			element = index
			index = this.size
		}
		if (index === 0) { // 如果是第一个，那么他就是头
			this.head = new Node(element, null)
		} else { // 找到前一个，然后将前一个的next 等于现在的，现在的等于前一个的next，就可以完成添加和插入了
			const prevNode = this._node(index - 1)
			prevNode.next = new Node(element, prevNode.next)
		}

		this.size++
	}
	remove(index) { // 找到前一个节点，然后让前一个节点等于next.next
		let removeNode
		if (index === 0) { // 断开第一个头的时候，将第二个挪到头的位置
			removeNode = this.head
			if (removeNode) {
				this.head = this.head.next
				this.size--
			}
		} else {
			const preveNode = this._node(index - 1)
			removeNode = preveNode.next
			preveNode.next = preveNode.next.next
			this.size--
		}

		return removeNode
	}
	reverseV1() { // 反转链
		// 后一个的next 等于前一个 一直递归下去
		const _next = (head) => {
			if (head === null || head.next === null) {
				return head
			}
			let newHead = _next(head.next) // 首先找到最后一个
			head.next.next = head
			head.next = null
			return newHead
		}
		return _next(this.head)
	}
	reverseV2() { // 创建一个新的头，一个个搬过去，第一个搬完，就把第二个赋值为头，然后搬过去之后就把新的头改成搬过去的，再讲新的头的next，等于旧的头
		let newHead = null
		while (this.head) {
			const oldHead = newHead
			newHead = this.head // 将头部搬过去
			this.head = this.head.next // 头部等于头部的后一个
			newHead.next = oldHead // 新的头的next等于旧的头
		}
		this.head = newHead // 修改成新的反转
		return newHead
	}
}

module.exports = Link

// const ll = new Link()
// ll.add(1)
// ll.add(2)
// ll.add(2, 100)
// ll.add(3)
// ll.add(4)
// ll.remove(3)
// ll.reverseV2()
// console.dir(ll, { depth: 100 })
