const {provide} = require('./invoker')

class Timeout {
    static record = new Map()
    static timeoutId = 0

    static cancelAll() {
        this.record.forEach(v => clearTimeout(v))
    }

    id = Timeout.timeoutId++

    constructor(handler, timeout=0) {
        Timeout.record.set(this.id, this.timeout = setTimeout(() => {
            handler.apply(undefined)
            Timeout.record.delete(this.id)
        }, timeout))
    }

    cancel() {
        if (Timeout.record.get(this.id)) {
            clearTimeout(this.timeout)
        }
    }
}

provide('clearTimers', () => {
    Timeout.cancelAll()
})

function timeout(callback, timeout=0) {
    return new Timeout(callback, timeout)
}

function interval(callback, t=50) {
    const loop = () => {
        callback.apply(undefined)
        let v = timeout(loop, t)
        val.id = v.id
        val.timeout = v.timeout
    }
    let val = timeout(callback, t)

    return val
}

module.exports = {
    timeout, interval
}