/**
 * @returns {{promise: Promise<any>,resolve: (value: any) => void,reject: (reason?: any) => void}}
 */
export function promiseResolvers() {
    let resolve, reject
    let promise = new Promise((res, rej) => {
        resolve = v => (res(v), resolve = reject = null)
        reject = e => (rej(e), resolve = reject = null)
    })

    return { promise, resolve, reject }
}

