import { createHashHistory } from "history";

const history = createHashHistory()

history.listen(update => {
  console.log('listen',update)
})

const unblock = history.block(tx => {
  let url = tx.location.pathname;
  if(url === '22') {
    if (window.confirm(`Are you sure you want to go to ${url}?`)) {
      // Unblock the navigation.
      // unblock();
  
      // Retry the transition.
      tx.retry();
    }
  }
})

