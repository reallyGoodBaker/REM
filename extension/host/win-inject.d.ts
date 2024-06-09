import net from 'net'

interface InvokerServer {
    on(channel: string, listener: (...args: any[]) => void): void
    handle(channel: string, listener: (...args: any[]) => void): void
}

interface Win {
    beforeClose: () => void,
    init: (winId: number) => void,
}

declare global {
    const win: Win
    const contextBridge: Electron.ContextBridge
    const ipcRenderer: Electron.IpcRenderer
    const webFrame: Electron.WebFrame
    const webUtils: Electron.WebUtils

    const server: (name: string, listener?: (socket: net.Socket) => void) => void
    const connect: (name: string) => net.Socket
    const invoke: (socket: net.Socket, data: string | Uint8Array) => Promise<any>
    const subscribe: (type: string, receiver?: (val: any) => void) => net.Socket
    const unlink: (name: string) => void

    const invoker: InvokerServer
}