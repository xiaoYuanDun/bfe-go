var text = `
- 章节一
  - 标题一
  - 标题二
    - 子标题三
  - 标题三  
- 章节二
  - 标题一
  - 标题二
`
class Node {
  constructor({ value, level = 0, parent = null }) {
    this.value = value
    this.level = level
    this.children = []
    this.parent = parent
    // hint: 也可在数据结构中增加 this.parent 节点辅助解析
  }
}

function parseTree(text) {
  const textArr = text.split('\n').filter((i) => i)
  const treeNode = []
  const _findPrevNode = (parent, level) => {
    if (!parent) {
      return null
    }
    if (parent.level === level) {
      return parent.parent
    }
    return _findPrevNode(parent.parent, level)
  }
  textArr.reduce(({ length, prevNode }, cur) => {
    const analyticsArr = cur.split('-')
    const nodePrevLength = analyticsArr.shift().length // - 之前的长度
    const element = analyticsArr.shift().trim()
    let node
    if (!nodePrevLength) {
      // 0级节点
      node = new Node({ value: element })
      treeNode.push(node)
      return {
        prevNode: node,
        length: 0,
      }
    } else if (nodePrevLength < length) {
      // 往前找树
      const parentNode = _findPrevNode(
        prevNode.parent,
        Math.ceil(nodePrevLength / 2)
      )
      console.log(parentNode)
      node = new Node({
        value: element,
        parent: parentNode,
        level: parentNode.level + 1,
      })
      parentNode.children.push(node)
    } else if (nodePrevLength === length) {
      // 同一层级，添加到上一层级的父节点里
      node = new Node({
        value: element,
        level: prevNode.level,
        parent: prevNode.parent,
      })
      prevNode.parent.children.push(node)
    } else if (nodePrevLength > length) {
      // 上一级的子节点
      node = new Node({
        value: element,
        level: prevNode.level + 1,
        parent: prevNode,
      })
      prevNode.children.push(node)
    }
    return {
      prevNode: node,
      length: nodePrevLength,
    }
  }, {})

  return treeNode
}

function parseTree2(text = '') {
  const nodeArr = text.split('\n').filter((it) => !!it.replace(/\s+/, ''))
  console.log(nodeArr)
  const reg = /^( *)- (.*)$/g
  const baseLength = nodeArr[0].split('-')[0].length
  const baseIdent = 2
  const parent = new Node({ value: '', level: 0 }) // 以下三个游标记录文本解析的当前位置

  let lastParent = parent
  let lastNode = null
  let lastLevel = 1

  for (let i = 0; i < nodeArr.length; i++) {
    const [, space, value] = reg.exec(nodeArr[i])
    const level = (space.length - baseLength) / baseIdent + 1
    const node = new Node({ value, level }) // level > lastLevel 时, 表示出现子节点 // level < lastLevel 表示当前节点延伸结束, 在更高层生成了新的节点, // 又因为由于缩进层级一次只能递增一位, 所以可以利用当前层级 lastLevel 递减找到具体是哪个层级有新节点生成

    if (level > lastLevel) {
      lastParent = lastNode
    } else if (level < lastLevel) {
      lastParent = lastNode
      while (lastLevel > level - 1) {
        lastParent = lastParent.parent
        lastLevel--
      }
    }

    node.parent = lastParent
    lastParent.children.push(node)

    lastLevel = level
    lastNode = node
    reg.lastIndex = 0
  }
  return parent.children
}

const tree = parseTree(text)
// [ Node { value: "章节一", children: [ Node, Node ], level: 1 },
//   Node { value: "章节二", children: [ Node, Node ], level: 1 } ]

console.log(tree)
