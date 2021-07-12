### TODO 待详细查看文档, 验证, 学习

- 关于 shared: 远程与宿主都需要配置 shared 才可以生效

<!-- ```js
// host 的模块组成
host: react_h1, m1, m2;

// remote 的模块组成
remote: react_r1, r1, r2;

// 当在 host 中引用 remote 时, 由于双方都配置了 share 为 react, 且 host 为宿主环境, 所以 host 的最终模块组成为:
// 注意这里, 使用了远程模块的 react_r1 而非本地 react_h1
host: react_r1, m1, m2;
``` -->

**测试中发现, 如果多个库都共享了模块(这里用 react 做示例) react , 那么最终选哪一个远程模块是不确定的, 但是最终他们都会选择同一个共享模块**

通过 chrome_dev 工具可以更清楚的验证这一点, 具体示例在 : **/micro/webpack-federation**

[官方介绍](https://webpack.docschina.org/concepts/module-federation/)

TODO 官方文档
