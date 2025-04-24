import * as net from 'net'
import { messageDecode, MessageType, messageEncode } from '../common/encodeDecoder'
import { ppath } from '../common/pipeName'
import { MessageReceiver } from './registry'
import { Provider } from '../common/provider'
import { IConsumer } from '../common/consumer'

const socks: Map<string, net.Socket> = new Map()
const consumers: Map<string, IConsumer> = new Map()

export function getExistingConsumer(name: string) {
    return consumers.get(name)
}

export class Consumer implements IConsumer {
    constructor(
        public readonly name: string
    ) {
        this.realPipe = ppath(name)
    }

    private realPipe: string
    private sock: net.Socket | null = null
    private waitings: Set<MessageReceiver> = new Set()

    private tryConnect(name: string) {
        const sock = net.connect(this.realPipe)
        sock.on('connect', () => {
            socks.set(name, sock)
        })
        sock.on('data', chunk => {
            const { type, uri, payload } = messageDecode(chunk)
            if (type !== MessageType.RETURN) {
                return
            }

            this.waitings.forEach((waiting, _, set) => {
                if (waiting.uri === uri) {
                    waiting.resolve(payload)
                    set.delete(waiting)
                }
            })
        })

        this.sock = sock
    }

    private hasSock() {
        if (this.sock)
            return true

        for (const name of socks.keys()) {
            if (name === this.realPipe) {
                return true
            }
        }

        return false
    }

    private getSock(): net.Socket {
        if (!this.sock) {
            const sock = socks.get(this.realPipe)
            if (sock) {
                //@ts-ignore
                this.sock = sock
            } else {
                this.tryConnect(this.name)
            }

            consumers.set(this.name, this)
        }

        return this.sock as net.Socket
    }

    close() {
        if (this.hasSock()) {
            const sock = this.getSock()
            sock.destroy()
        }
    }

    read(uri: string) {
        const encoded = messageEncode({
            type: MessageType.READ,
            uri,
            payload: Buffer.alloc(0)
        })

        const sock = this.getSock()
        const promise = new Promise<Buffer>(resolve => {
            this.waitings.add({
                promise, uri, resolve
            })
        })

        sock.write(encoded as any)

        return promise
    }

    write(uri: string, payload: Buffer) {
        const encoded = messageEncode({
            type: MessageType.WRITE,
            uri,
            payload
        })

        const sock = this.getSock()
        sock.write(encoded as any)
    }

    delete(uri: string) {
        const encoded = messageEncode({
            type: MessageType.DELETE,
            uri,
            payload: Buffer.alloc(0)
        })

        const sock = this.getSock()
        sock.write(encoded as any)
    }
}

export class LocalConsumer implements IConsumer {
    constructor(
        public readonly name: string,
        private provider: Provider,
    ) {
        consumers.set(name, this)
    }

    read(uri: string) {
        return this.provider.read(uri)
    }

    write(uri: string, payload: Buffer) {
        return this.provider.write(uri, payload)
    }

    delete(uri: string) {
        return this.provider.delete(uri)
    }
}