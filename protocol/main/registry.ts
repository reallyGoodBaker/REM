import { LookupConfig, Provider, ProviderDescritpor } from '../common/provider'
import * as net from 'net'
import { pipeName } from '../common/pipeName'
import { Consumer, getExistingConsumer, LocalConsumer } from './consumer'
import { IConsumer } from '../common/consumer'

const registry: Set<ProviderDescritpor> = new Set()

function findFromRegistry(name: string) {
    for (const record of registry) {
        if (record.name === name) {
            return record
        }
    }
    return null
}

export function lookup(conf: LookupConfig): ProviderDescritpor[] {
    const providers: ProviderDescritpor[] = []
    for (const record of registry) {
        const { category, name } = record

        if (conf.name && name.includes(conf.name)) {
            providers.push(record)
            continue
        }

        if (conf.category && category === conf.category) {
            providers.push(record)
        }
    }

    return providers
}

interface ProviderRecord extends ProviderDescritpor {
    readonly provider: Provider
}

export function registerInMain(
    desc: ProviderDescritpor,
    provider: Provider,
): void {
    //@ts-ignore
    desc.provider = provider
    registry.add(desc)
}

export function register(desc: ProviderDescritpor) {
    registry.add(desc)
}

export function setupRegistry() {
    net.createServer(sock => {
        sock.on('data', buf => {
            const request = JSON.parse(buf.toString()) as any
            const { type, payload } = request
            if (type === 'lookup') {
                const lookupConf = payload as LookupConfig
                const providers = lookup(lookupConf)
                sock.write(JSON.stringify(providers))
            } else if (type === 'register') {
                register(payload)
                sock.write('{}')
            } else if (type === 'unregister') {
                const { name } = payload
                const record = findFromRegistry(name)
                if (record) {
                    registry.delete(record)
                }
                sock.write('{}')
            }

            sock.end()
        })
    }).listen(pipeName() + 'provider.registry')
}

export interface MessageReceiver {
    promise: Promise<Buffer>
    uri: string
    resolve: (v: Buffer) => void
}

export function getOrCreateConsumer(name: string): IConsumer | null {
    const desc = findFromRegistry(name)
    if (!desc) {
        return null
    }

    const { provider, name: n } = desc as ProviderRecord
    const excistingConsumer = getExistingConsumer(n)
    if (excistingConsumer) {
        return excistingConsumer
    }

    if (provider) {
        return new LocalConsumer(n, provider)
    }

    return new Consumer(n)
}