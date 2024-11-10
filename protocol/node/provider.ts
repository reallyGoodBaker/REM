import * as net from 'net'
import { pipeName } from '../common/pipeName'
import { LookupConfig, ProviderDescritpor } from '../main/registry'
import { promiseResolvers, Provider } from '../common/provider'
import { messageDecode, messageEncode } from '../common/encodeDecoder'

const pack = (type: string, payload: any) => JSON.stringify({ type, payload })

export async function lookup(conf: LookupConfig) {
    const { promise, resolve } = promiseResolvers()
    const socket = net.connect(pipeName() + 'provider.registry')
    let buffer = Buffer.alloc(0)
    socket.on('data', buf => Buffer.concat([buffer as any, buf as any]))
    socket.on('end', () => {
        resolve(JSON.parse(buffer.toString()))
        socket.end()
    })
    socket.write(pack('lookup', conf))

    return promise
}

async function registerOnNet(conf: ProviderDescritpor) {
    const { promise, resolve } = promiseResolvers()
    const socket = net.connect(pipeName() + 'provider.registry')
    let buffer = Buffer.alloc(0)
    socket.on('data', buf => Buffer.concat([buffer as any, buf as any]))
    socket.on('end', () => {
        resolve(JSON.parse(buffer.toString()))
        socket.end()
    })
    socket.write(pack('register', conf))

    return promise
}

export async function registerProvider(conf: ProviderDescritpor, provider: Provider) {
    await registerOnNet(conf)
    net.createServer(sock => {
        let buffer = Buffer.alloc(0)
        sock.on('data', buf => Buffer.concat([ buffer as any, buf as any]))
        sock.on('end', async () => {
            const { type, uri, payload } = messageDecode(buffer)

            switch (type) {
                case 0:
                    await provider.create(uri, payload)
                    break
            
                case 1:
                    sock.write(messageEncode(5, uri, await provider.read(uri)) as any)
                    break

                case 2:
                    await provider.update(uri, payload)
                    break

                case 3:
                    await provider.delete(uri)
                    break
            }

            sock.end()
        })
    }).listen(pipeName() + conf.pipeName)
}