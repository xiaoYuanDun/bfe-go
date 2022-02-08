import type Fetch from './Fetch';

/**
 * 远程请求函数的类型定义，useRequest 的基础范型就是又他推导出来的
 */
export type Service<TData, TParams extends any[]> = (
  ...args: TParams
) => Promise<TData>;

export type Options<TData, TParams extends any[]> = {
  // 是否立即执行异步，默认为 false，表示立即执行
  manual?: boolean;
  // 默认参数
  defaultParams?: TParams;

  // loading delay
  loadingDelay?: number;

  // polling
  pollingInterval?: number;

  // debounce，和 lodash.debounce 含义相同
  debounceWait?: number;
  debounceLeading?: boolean;
  debounceTrailing?: boolean;
  debounceMaxWait?: number;
};

/**
 * plugin 的约定类型
 */
export type Pulgin<TData, TParams extends any[]> = {
  // 扩展插件可能会用到 opstions 中的任何配置，所以要提供全量配置信息
  // 通过作为可扩展的插件系统，这也是必须的
  (
    fetchInstance: Fetch<TData, TParams>,
    options: Options<TData, TParams>
  ): PluginReturn<TData, TParams>;

  // 用于 useAutoRunPlugin 的首个初始化状态
  // onInit?: (
  //   options: Options<TData, TParams>
  // ) => Partial<FetchState<TData, TParams>>;
};

/**
 * 返回一些生命周期钩子，每个插件有可能会在不同的请求周期造成影响，这样设计，
 * 就给扩展插件赋予了影响所有生命周期的能力，只要返回对应的周期方法，即视为注册了对应周期钩子
 * 插件本身不用关心如何调用钩子，只需要按照约定提供合法规范的周期函数
 * 生命周期钩子的调用，由 fetch 实体来处理，
 */
export type PluginReturn<TData, TParams extends any[]> = {
  onBefore?: () => void;
  onFinally?: () => void;

  onCancel?: () => void;
};

// ------------- fetch something -------------
export type Subscribe = () => void;

// fetch 单例实体存储的 state
export interface FetchState<TData, TParams extends any[]> {
  loading: boolean;
  params?: TParams;
  data?: TData;
  error?: Error;
}

// 实体最终对外暴露的属性和接口
export interface Result<TData, TParams extends any[]> {
  loading: boolean;
  data?: TData;
  run: Fetch<TData, TParams>['run'];
  runAsync: Fetch<TData, TParams>['runAsync'];
  cancel: Fetch<TData, TParams>['cancel'];
  refresh: Fetch<TData, TParams>['refresh'];
  refreshAsync: Fetch<TData, TParams>['refreshAsync'];
  // error?: Error;
  // params: TParams | [];
  // mutate: Fetch<TData, TParams>['mutate'];
}
