import type { IpcRenderer } from 'electron'
import type { LookupConfig, ProviderDescritpor } from '../common/provider'
import { EncodeDecoder, noneEncodeDecoder } from '../common/encodeDecoder'

//@ts-ignore
const ipcRenderer: IpcRenderer = hooks


class RemoteConsumer<T=Uint8Array> {
    constructor(
        private readonly desc: ProviderDescritpor,
        private readonly encodeDecoder: EncodeDecoder<T> = noneEncodeDecoder
    ) {}

    async read(uri: string) {
        return this.encodeDecoder.decode(
            await ipcRenderer.invoke('consumer.read', this.desc.name, uri)
        )
    }

    write(uri: string, data: any) {
        return ipcRenderer.invoke(
            'consumer.write',
            this.desc.name,
            uri,
            this.encodeDecoder.encode(data)
        )
    }

    delete(uri: string) {
        return ipcRenderer.invoke('consumer.delete', this.desc.name, uri)
    }
}

function lookup(conf: LookupConfig): Promise<ProviderDescritpor[]> {
    return ipcRenderer.invoke('consumer.lookup', conf)
}

function create<T>(desc: ProviderDescritpor, encodeDecoder?: EncodeDecoder<T>) {
    return new RemoteConsumer(desc, encodeDecoder)
}

export function consumer(): [ typeof lookup, typeof create ] {
    return [
        lookup,
        create
    ]
}