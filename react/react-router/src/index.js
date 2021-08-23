import { createHashHistory } from '../origin/hash';
// import matchPath from '../origin/matchPath';
// matchPath('#/aaa/d', '#/aaa/c');

const history = createHashHistory();

history.listen((update) => {
  console.log('listen', update);
});
(async function () {
  await new Promise((resolve) => setTimeout(resolve, 500));
  history.push('111');
  await new Promise((resolve) => setTimeout(resolve, 500));
  history.push('222');
  await new Promise((resolve) => setTimeout(resolve, 500));
  history.push('333');
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // window.location.hash = '111';
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // window.location.hash = '222';
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // window.location.hash = '333';
})();
