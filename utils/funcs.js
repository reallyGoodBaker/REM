export function throttle(func, time) {
    let timer

    return (...args) => {
        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(() => {
            func.apply(undefined, args)
        }, time);

    }
}


export function bonunce(func, time) {
    let timer

    return (...args) => {
        if (timer) {
            return
        }

        timer = setTimeout(() => {
            func.apply(undefined, args)
            clearTimeout(timer)
            timer = null
        }, time);
    }
}


export function promiseResolvers() {
    let resolve, reject
    let promise = new Promise((res, rej) => {
        resolve = v => res(v)
        reject = e => rej(e)
    })

    return { promise, resolve, reject }
}