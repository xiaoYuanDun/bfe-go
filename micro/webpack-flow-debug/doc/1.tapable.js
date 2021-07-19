
class SyncHook {
  constructor() {
    this.taps = []
  }
  tap(name, fn) {
    this.taps.push(fn)
  }
  call(...args) {
    this.taps.forEach(fn => fn(args))
  }
}