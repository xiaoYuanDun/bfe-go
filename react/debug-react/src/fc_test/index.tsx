import React, { useState } from 'react';
import Son from './Son';

/**
 * 使用 <Son /> 调用时，Parent 对应的 fiber反应了正常的 hook 结构，即：
 * 他描述了当前 FC 中的 hook 及其他们的链表组成，可以看到这里 第二个 hook 的 next 为 null，表示本组件 hooks 已结束
 *   fiber(Parent): {
 *     // ...
 *     memoizedState: {
 *       // 第一个 hook
 *       baseQueue: null,
 *       baseState: 0,
 *       memoizedState: 0,
 *       queue: { //... },
 *       next: {
 *         // 第二个 hook
 *         baseQueue: null
 *         baseState: "xiaoMing"
 *         memoizedState: "xiaoMing"
 *         next: null
 *         queue: { //... }
 *       }
 *     },
 *     // ...
 *   }
 *
 * 再来看一下当 Son() 调用时，Parent 对应的 fiber 里 memoizedState 的情况：
 *   fiber(Parent): {
 *     // ...
 *     memoizedState: {
 *       // 第一个 hook
 *       baseQueue: null,
 *       baseState: 0,
 *       memoizedState: 0,
 *       queue: { //... },
 *       next: {
 *         // 第二个 hook
 *         baseQueue: null
 *         baseState: "xiaoMing"
 *         memoizedState: "xiaoMing"
 *         queue: { //... }
 *         // Son 中的第一个 hook
 *         next: {
 *           baseQueue: null
 *           baseState: null
 *           memoizedState: {tag: 5, destroy: undefined, deps: null, next: {…}, create: ƒ}
 *           next: null
 *           queue: null
 *         }
 *       }
 *     },
 *     // ...
 *   }
 *
 * 这时我们找到了问题，子组件的 useEffect hook 被提升到父组件 Parent 中了，所以在 Parent 提前 return 后，就会报这个错
 * "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."
 * 意思是，在所有 hooks 执行完之前提前退出了，可是，问题是，为什么 Son 中的 hook 会被提升到 Parent 中呢？
 *
 * 通过调试，发现是在 FC 的 hooks 链的构造是发生在 beginWork 阶段的 renderWithHooks 方法内
 * 当 Parent 的 hook 构建完毕后，return 语句内的内容会被转化为 vdom 形式，这个过程中 Son() 会被知道用，导致 Son 的函数体也被执行，
 * 而 Son 也含有 hook，Son 的 hook 被执行时，workInProgress 还指向 Parent.fiber，这个时初始化 Son 的 hook，就会导致其被错误的
 * 添加在 Parent 的 hook 链的末尾，因为 被执行时，workInProgress 指向 Parent.fiber 并且 workInProgressHook 指向 parent 的最后一个 hook，
 * 那么，在 Parent 中 count === 2 时，就会因为提前 retrun，导致这个被误判的 Son 的 hook 没有执行而报错
 *
 * 同时，因为 Son() 调用后返回了内部的 return 内容，所以再生成他的 fiber 时，就没有 Son 了，从 workInProgress 的 type 可以看到，他的类型
 * 是一个 "div"，即原始 Son 的返回值，这种时候只会简单的把这个 div 当成一个原生节点，添加在 Parent 上，而且他是不带任何 hook 逻辑的，因为
 * hook 逻辑已经被追加在 Parent 的末尾了
 *
 * <Son />:
 *   Parent.hook: useState -> useState
 *   children: [Parent:, {count}, button, Son]
 *
 * Son():
 *   Parent.hook: useState -> useState -> useEffect(Son的，被错误提升)
 *   children: [Parent:, {count}, button, div(Son的返回值)]
 *
 * 看到区别了吗？
 * 所以如果子组件是动态 FC，可以使用 createElement 而非 函数调用
 */
const Parent = () => {
  const [count, setCount] = useState(0);

  const [name, setName] = useState('xiaoMing');

  if (count === 2) return <div>stopped !!!</div>;

  return (
    <div>
      Parent: {count}
      <button onClick={() => setCount(count + 1)}>click me ...</button>
      <Son />
      {/* {Son()} */}
    </div>
  );
};

export default Parent;
