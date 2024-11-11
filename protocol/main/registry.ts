import { LookupConfig, Provider, ProviderDescritpor } from '../common/provider'
import * as net from 'net'
import { pipeName } from '../common/pipeName'

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
        const { category, pipeName, name } = record

        if (pipeName === conf.pipeName) {
            return [ record ]
        }

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

const defaultConfig: LookupConfig = {
    name: 'default',
    category: 'default',
}

interface ProviderRecord extends ProviderDescritpor {
    readonly provider: Provider
}

export function registerInMain(
    pipeName: string,
    provider: Provider,
    conf: LookupConfig=defaultConfig
): void {
    const record: ProviderRecord = {
        pipeName, provider,
        ...conf,
        ...defaultConfig
    } as unknown as ProviderRecord

    registry.add(record)
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
