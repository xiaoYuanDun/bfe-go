function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('middleware 必须是数组');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware 必须是函数的组合!');
  }

  return (ctx) => {
    let index = -1;

    const dispatch = (i) => {
      if (i <= index) {
        // throw new Error('next 不能重复调用!');
        return Promise.reject('next 不能重复调用!');
      }

      index = i;

      if (i === middleware.length) {
        return Promise.resolve();
      }

      const fn = middleware[i];

      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (e) {
        throw Promise.reject(e);
      }
    };

    return dispatch(0);
  };
}

module.exports = compose;

//
