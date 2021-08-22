```js
createHashHistory

  window.addEventListener('popstate', handlePop);

  window.addEventListener('hashchange', () => {
    let [, nextLocation] = getIndexAndLocation();
    // Ignore extraneous hashchange events.
    if (createPath(nextLocation) !== createPath(location)) {
      handlePop();
    }
  });

```


```js 
// history usage:
const history = createHashHistory()

const listener = update => {
  console.log(update)
}

history.listen(listener)

```