import * as net from 'net'
import * as fs from 'fs'
import { pipeName } from '../common/pipeName';
import { LookupConfig, ProviderDescritpor } from '../common/provider'
import { promiseResolvers, Provider } from '../common/provider'
import { messageDecode, messageEncode } from '../common/encodeDecoder'

const pack = (type: string, payload: any) => JSON.stringify({ type, payload })

export async function lookup(conf: LookupConfig) {
    const { promise, resolve } = promiseResolvers()
    const socket = net.connect(pipeName() + 'provider.registry')
    socket.on('data', buf => {
        resolve(JSON.parse(buf.toString()))
        socket.end()
    })
    socket.write(pack('lookup', conf))

    return promise
}

async function registerOnNet(conf: ProviderDescritpor) {
    const { promise, resolve, reject } = promiseResolvers()
    const sock = net.connect(pipeName() + 'provider.registry')
        .on('data', buf => {
            resolve(JSON.parse(buf.toString()))
            sock.end()
        })
        .on('error', reject)

    sock.write(pack('register', conf))

    return promise
}

async function handleConsume(buffer: Buffer, sock: net.Socket, provider: Provider) {
    const { type, uri, payload } = messageDecode(buffer)

    switch (type) {
        case 0:
            sock.write(messageEncode(5, uri, await provider.read(uri)) as any)
            break

        case 1:
            await provider.write(uri, payload)
            break

        case 2:
            await provider.delete(uri)
            break
    }
}

export async function registerProvider(conf: ProviderDescritpor, provider: Provider) {
    await registerOnNet(conf)
    net.createServer(sock => {
        sock.on('data', buf => handleConsume(buf, sock, provider))
    }).listen(pipeName() + conf.pipeName)
}

export function unregisterProvider(pipename: string) {
    const sock = net.connect(pipeName() + 'provider.registry')
        .on('data', () => {
            sock.end()
            if (fs.existsSync(pipeName() + pipename)) {
                fs.unlinkSync(pipeName() + pipename)
            }
        })

    sock.write(pack('unregister', { pipeName: pipeName() + pipename }))
}