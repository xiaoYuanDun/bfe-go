import { getBatch } from './batch';

// // encapsulates the subscription logic for connecting a component to the redux store, as
// // well as nesting subscriptions of descendant components, so that we can ensure the
// // ancestor components re-render before descendants

type VoidFunc = () => void;

// listener 的链表结构
type Listener = {
  callback: VoidFunc;
  next: Listener | null;
  prev: Listener | null;
};

function createListenerCollection() {

  // batch(fn) -> 执行 fn, 仅此而已
  const batch = getBatch();
  let first: Listener | null = null;
  let last: Listener | null = null;

  return {
//     clear() {
//       first = null;
//       last = null;
//     },

    // 遍历调用所有 listeners 的 callback 方法
    notify() {
      batch(() => {
        let listener = first;
        while (listener) {
          listener.callback();
          listener = listener.next;
        }
      });
    },

//     get() {
//       let listeners = [];
//       let listener = first;
//       while (listener) {
//         listeners.push(listener);
//         listener = listener.next;
//       }
//       return listeners;
//     },

    subscribe(callback: () => void) {
      let isSubscribed = true;

      let listener: Listener = (last = {
        callback,
        next: null,
        prev: last,
      });

      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;

        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }
        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    },
  };
}

type ListenerCollection = ReturnType<typeof createListenerCollection>;

export interface Subscription {
  addNestedSub: (listener: VoidFunc) => VoidFunc;
  notifyNestedSubs: VoidFunc;
  handleChangeWrapper: VoidFunc;
//   isSubscribed: () => boolean;
  onStateChange?: VoidFunc | null;
  trySubscribe: VoidFunc;
//   tryUnsubscribe: VoidFunc;
//   getListeners: () => ListenerCollection;
  pl: any
}

const nullListeners = ({
  notify() {},
  get: () => [],
} as unknown) as ListenerCollection;

export function createSubscription(store: any, parentSub?: Subscription) {
  let unsubscribe: VoidFunc | undefined;
  let listeners: ListenerCollection = nullListeners;

  function addNestedSub(listener: () => void) {
    trySubscribe();
    return listeners.subscribe(listener);
  }

  function notifyNestedSubs() {
    listeners.notify();
  }

  // 订阅的都是这个包装函数, 内部 onStateChange 才是真正的订阅引用
  function handleChangeWrapper() {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }

//   function isSubscribed() {
//     return Boolean(unsubscribe);
//   }

  function trySubscribe() {
    console.log('trySubscribe ...');
    if (!unsubscribe) {
      unsubscribe = parentSub
        ? parentSub.addNestedSub(handleChangeWrapper)
        : store.subscribe(handleChangeWrapper);

      listeners = createListenerCollection();
    }
  }

//   function tryUnsubscribe() {
//     if (unsubscribe) {
//       unsubscribe();
//       unsubscribe = undefined;
//       listeners.clear();
//       listeners = nullListeners;
//     }
//   }

  const subscription: Subscription = {
    addNestedSub,
    notifyNestedSubs,
    handleChangeWrapper,
//     isSubscribed,
    trySubscribe,
//     tryUnsubscribe,
//     getListeners: () => listeners,
    pl: store.pl
  };

  return subscription;
}
