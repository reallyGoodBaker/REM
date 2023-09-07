export function promiseResolvers() {
    let resolve, reject
    let promise = new Promise((res, rej) => {
        resolve = v => res(v)
        reject = e => rej(e)
    })

    return { promise, resolve, reject }
}

