function promiseResolvers() {
    let resolve, reject
    let promise = new Promise((res, rej) => {
        resolve = v => (res(v), resolve = reject = null)
        reject = e => (rej(e), resolve = reject = null)
    })

    return {
        /**@type {Promise<any>}*/
        promise,
        /**@type {(value: any) => void}*/
        resolve,
        /**@type {(reason?: any) => void}*/
        reject
    }
}

module.exports = {
    promiseResolvers,
}