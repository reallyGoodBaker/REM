export interface Provider {
    create(uri: string, value: Buffer): Promise<void>
    read(uri: string): Promise<Buffer>
    update(uri: string, value: Buffer): Promise<void>
    delete(uri: string): Promise<void>
}

export function promiseResolvers<T>(): {
    promise: Promise<T>
    resolve: (value: void) => void
    reject: (reason: any) => void
} {
    let resolve: any
    let reject: any

    const promise = new Promise<void>((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })

    return {
        //@ts-ignore
        promise,
        resolve,
        reject,
    }
}