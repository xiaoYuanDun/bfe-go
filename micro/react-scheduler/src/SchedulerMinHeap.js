/**
 * 优先队列，小顶堆实现
 */
function push(heap, node) {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

function pop(heap) {
  if (heap.length === 0) return null;

  const first = heap[0];
  const tail = heap.pop();

  if (first !== tail) {
    heap[0] = tail;
    siftDown(heap, tail, 0);
  }
  return first;
}

function peek(heap) {
  if (heap.length === 0) return null;
  return heap[0];
}

// 新入堆的节点要向上浮动到合适的位置
function siftUp(heap, node, i) {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(heap[parentIndex], heap[index]) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

// pop 之后，结尾节点成为新的队首节点，需要下沉到合适的位置
function siftDown(heap, node, i) {
  const length = heap.length;
  let index = i;
  const endIndex = heap.length >>> 1;
  while (index < endIndex) {
    const leftIndex = (index + 1) * 2 - 1;
    const rightIndex = (index + 1) * 2;
    const left = heap[leftIndex];
    const right = heap[rightIndex];
    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
}

// 排队机制，首先比较过期时间（sortIndex），然后比较 id
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

export { push, pop, peek };
