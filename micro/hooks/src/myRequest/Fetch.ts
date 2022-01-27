import React, { MutableRefObject } from 'react';

import type {
  Service,
  Options,
  Subscribe,
  FetchState,
  PluginReturn,
} from './types';

/**
 * 有两条主要流程：
 *
 * 1. 自动执行 service
 *   - 初始化 loading 为 true
 *
 *
 * 2. 手动执行 service
 *   - 初始化 loading 为 false，开始静默阶段，等待 run/runAsync 调用
 *   - 某些条件触发 run/runAsync 调用，改变 loading 状态（re-render）
 *   - 经过若干时间，得到返回值，改变 loading 状态，结果值（re-render）
 *
 *
 */
class Fetch<TData, TParams extends any[]> {
  count: number = 0;
  pluginImpls: PluginReturn<TData, TParams>[] = [];

  state: FetchState<TData, TParams> = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  // 实体初始化，仅根据 manual 处理一下初始 loading 状态
  // 如果 manual 表示手动触发，那么初始化 loading 应该是 false，否则直接开始请求，就是 true
  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,
    public options: Options<TData, TParams>,
    public subscribe: Subscribe,
    public initState: Partial<FetchState<TData, TParams>> = {}
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual,
      ...initState,
    };
  }

  setState(s: Partial<FetchState<TData, TParams>> = {}) {
    this.state = {
      ...this.state,
      ...s,
    };
    this.subscribe(); // 更新完毕，触发一下监听函数
  }

  // 根据钩子的 key，调用所以注册了此 key 的插件钩子
  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
    const res = this.pluginImpls
      // @ts-ignore
      .map((plugin) => plugin[event]?.(...rest))
      .filter(Boolean);
    return { ...res };
  }

  // 不过这里不是真正的取消请求（如 AbortController，https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController）
  // 而是仅仅把加载状态置为 false
  cancel() {
    // 请求过程标量，一个序号唯一的表示一次请求过程
    this.count += 1;
    this.setState({ loading: false });

    // 执行 [onCancel] 钩子，只要是插件中定义了这个 key 的函数，都会在这里被调用
    this.runPluginHandler('onCancel');
  }

  async runAsync(...params: TParams): Promise<TData> {
    // 每次新的请求都对应一个递增的新的 ID
    this.count++;
    const currentCount = this.count;

    // TODO，自动执行时，这里会造成一次多余的 re-render
    this.setState({ loading: true });

    const res = await this.serviceRef.current(...params);

    // TODO，这里返回一个用不决议的 promise，我是这样理解的
    // 因为如果用户使用了 runAsync.then 那么即使组件卸载了，再返回值到达时，依然可以执行 then 中定义的回调
    // 这有可能不是用户期待的，
    // 但是如果用不决议，那么 then 回调永远不会被释放，不知道会不会有什么性能问题
    if (currentCount !== this.count) return new Promise(() => {});

    this.setState({ data: res, loading: false });
  }

  // TODO，这里其实调用的也是异步方式，和官方文档的描述有出入
  // 没有返回 promise 而已，对用户来说，表现形式是个同步函数，内部实际上是对 runAsync 做了一层 catch
  // https://ahooks.js.org/zh-CN/hooks/use-request/basic#%E6%89%8B%E5%8A%A8%E8%A7%A6%E5%8F%91
  run(...params: TParams) {
    // this.runAsync(...params).catch((error) => {
    //   if (!this.options.onError) {
    //     console.error(error);
    //   }
    // });

    this.runAsync(...params);
  }
}

export default Fetch;
