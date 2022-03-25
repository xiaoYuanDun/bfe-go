function compose(middlewares) {
  return function (ctx) {
    let index = -1;

    const dispatch = (i) => {
      // 每次执行 dispatch 都会更新 index，如果出现下面的情况，说明某个 next 被调用了两次，这是不被允许的
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'));

      index = i;

      let fn = middlewares[i];

      if (!fn) return Promise.resolve();

      return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
    };

    return dispatch(0);
  };
}

module.exports = compose;
