////////////////////////////////////////////////////////////////////////////////
// COMMON TYPES
////////////////////////////////////////////////////////////////////////////////

export type State = object | null;

export type Pathname = string;

export type Search = string;

export type Hash = string;

export type Key = string;

export interface Update<S extends State = State> {
  // 当前历史栈进行了何种操作（POP, PUSH, REPLACE）
  action: Action;

  // 新的 location
  location: Location<S>;
}

/**
 * location 发生变化是的回调
 */
export interface Listener<S extends State = State> {
  (update: Update<S>): void;
}

export interface Path {
  /**
   * URL 的 pathname 部分，以 '/' 开头
   */
  pathname: Pathname;

  /**
   * URL 的 search 部分，以 '?' 开头
   */
  search: Search;

  /**
   * URL 的 hash 部分，以 '#' 开头
   */
  hash: Hash;
}

export type PartialPath = Partial<Path>;

/**
 * 描述了一个需要被导航到的目标地址（要导航到哪里），可以通过 history.push 或 history.replace 调用。
 * 可以是一个 URL 或者 URL 的 path 部分
 */
export type To = string | PartialPath;

/**
 * history 栈中的历史对象实体，一个 location 对象包含了 URL 相关的信息，同样也可以包含任意的 state 负载对象和一个 key
 */
export interface Location<S extends State = State> extends Path {
  /**
   * 和当前 location 关联的 state 对象，可以是任意对象，存储任意值
   */
  state: S;

  /**
   * 一个和 location 关联的唯一字符串
   */
  key: Key;
}

/**
 * history.js 的关键对象，和 window.history 很像，但是更小，并且扩展了一些专用 API
 *
 * 一个 history 可以描述和操作 history 栈的行为，它提供了当前 location 的状态，并且提供了可以操作修改他们的方法
 */
export interface History<S extends State = State> {
  /**
   * 描述了上一次 history 的操作类型，注意，当一个 history 单例被新建时，他的这个操作会被描述为一个 POP。这个值是只读的
   */
  readonly action: Action;

  /**
   * 当前的 location，这个值是只读的
   */
  readonly location: Location<S>;

  /**
   * 向 history 栈当前索引处，推入一个新的历史对象，如果当前索引上面如果还有其他历史对象，他们会全部丢失，这个新的历史对象会成为栈顶元素
   */
  push(to: To, state?: S): void;

  /**
   * 用一个新的历史对象替换 history 栈当前指针所指向的历史对象，被替换的历史对象再也无法操作到了
   */
  replace(to: To, state?: S): void;

  /**
   * 向前或向后导航 n 步
   * @param delta
   */
  go(delta: number): void;

  /**
   * 向前导航一步，如果当前索引是指向栈底，那么调用 back 会卸载当前页面
   */
  back(): void;

  /**
   * 向后导航一步
   */
  forward(): void;

  /**
   * 注册 location 监听函数，当 location 变化时，触发回调
   */
  listen(listener: Listener<S>): () => void;
  // TODO，不常用，先放一放
  /**
   * Returns a valid href for the given `to` value that may be used as
   * the value of an <a href> attribute.
   *
   * @param to - The destination URL
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.createHref
   */
  createHref(to: To): string;

  // TODO，一个拦截器
  /**
   * Prevents the current location from changing and sets up a listener that
   * will be called instead.
   *
   * @param blocker - A function that will be called when a transition is blocked
   * @returns unblock - A function that may be used to stop blocking
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.block
   */
  block(blocker: Blocker<S>): () => void;
}

export interface BrowserHistory<S extends State = State> extends History<S> {}

export enum Action {
  /**
   * 切换到 history 栈的任意一个索引，可以说是进行了一次 POP 操作，如 back，forward（后退，前进）。
   * POP 操作不能描述导航的方向（比如，back 表示从后到前），它仅仅描述了当前 history 栈的索引位置（在哪一个索引处）
   *
   * Note: This is the default action for newly created history objects.
   */
  Pop = 'POP',

  /**
   * 向 history 栈入栈一个新的历史状态，可以说是一次 PUSH 操作，如点击新链接并且加载了一个新的页面。
   * 当 PUSH 操作触发时，他所处的索引后的所有历史对象都会丢失（这个 PUSH 操作生成的历史对象会成为新的 history 栈的栈顶元素）
   */
  Push = 'PUSH',

  /**
   * history 栈当前索引指向的历史对象被一个新的历史对象替换，可以说是一次 REPLACE 操作
   */
  Replace = 'REPLACE',
}

////////////////////////////////////////////////////////////////////////////////
// BROWSER
////////////////////////////////////////////////////////////////////////////////

export function createBrowserHistory() {}
