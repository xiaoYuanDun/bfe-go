class Node {
  constructor(element, parent) {
    this.element = element
    this.parent = parent
    this.left = null
    this.right = null
  }
}

class Tree {
  constructor() {
    this.node = null
  }
  add(element) {
    let parentNode = null
    let node = this.node
    let prefix = 'left'
    // 找左边还是右边，直到没有为止，然后将element放下
    if (!this.node) {
      this.node = new Node(element)
      return
    }
    while (node) {
      parentNode = node
      if (element >= node.element) {
        prefix = 'right'
      } else {
        prefix = 'left'
      }
      node = node[prefix]
    }
    parentNode[prefix] = new Node(element, parentNode)
  }
}

const tree = new Tree()
;[10, 8, 19, 6, 15, 22, 20].forEach((item) => {
  tree.add(item)
})

console.dir(tree, { depth: 100 })
