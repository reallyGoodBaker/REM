export interface Provider {
    read(uri: string): Promise<Buffer>
    write(uri: string, value: Buffer): Promise<void> | void
    delete(uri: string): Promise<void> | void
}

export function promiseResolvers<T>(): {
    promise: Promise<T>
    resolve: (value?: T) => void
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

export type LookupConfig = Partial<ProviderDescritpor>

export type ProviderCategories = 'song' | 'album' | 'artist' | 'playlist' | 'genre' | 'tag' | 'user' | 'playlist'
export type ProviderCategory = `provider.${ProviderCategories}` | 'default'

export interface ProviderDescritpor {
    readonly name: string
    readonly category: ProviderCategory
}