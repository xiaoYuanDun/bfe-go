const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'



function _Promise(exector) {

    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.fullfilledListeners = []
    this.rejectedListeners = []


    this.resolve = (value) => {
        this.value = value
        this.status = FULLFILLED
        this.fullfilledListeners.forEach(cb => { cb() })
    }

    this.reject = (reason) => {
        this.reason = reason
        this.status = REJECTED
        this.rejectedListeners.forEach(cb => { cb() })
    }

    exector(this.resolve, this.reject)

}

_Promise.prototype.then = function (onFullfilled, onRejected) {

    if (this.status === PENDING) {
        this.fullfilledListeners.push(() => {
            onFullfilled(this.value)
        })
        this.rejectedListeners.push(() => {
            onRejected(this.reason)
        })
    }
    if (this.status === FULLFILLED) {
        onFullfilled(this.value)
    }
    if (this.status === REJECTED) {
        onRejected(this.reason)
    }


}


console.log('start...')

const p1 = new _Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    }, 1000);
})

p1.then(val => {
    console.log('val: ', val)
}, err => {
    console.log('err: ', err)
})