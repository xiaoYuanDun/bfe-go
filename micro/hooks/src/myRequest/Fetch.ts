import React, { MutableRefObject } from 'react';

import type { Service, Options, Subscribe, FetchState } from './types';

/**
 * 有两条主要流程：
 *
 * 1. 自动执行 service
 *   - 初始化 loading 为 true
 *
 *
 * 2. 手动执行 service
 *   - 初始化 loading 为 false，开始静默阶段，等待 run/runAsync 调用
 *
 *
 */
class Fetch<TData, TParams extends any[]> {
  count: number = 0;

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

  async runAsync(...params: TParams): Promise<TData> {
    this.setState({ loading: true });

    const res = await this.serviceRef.current(...params);

    this.setState({ data: res, loading: false });
  }

  // TODO，这里其实调用的也是异步方式，和官方文档的描述有出入
  // https://ahooks.js.org/zh-CN/hooks/use-request/basic#%E6%89%8B%E5%8A%A8%E8%A7%A6%E5%8F%91
  // 没有返回 promise 而已，对用户来说，表现形式是个同步函数，内部实际上是对 runAsync 做了一层 catch
  run(...params: TParams) {
    // this.runAsync(...params).catch((error) => {
    //   if (!this.options.onError) {
    //     console.error(error);
    //   }
    // });

    this.runAsync(...params);
  }

  // go() {
  //   this.setState({ loading: true });
  // }
}

export default Fetch;
