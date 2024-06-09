import net from 'net'

interface InvokerServer {
    on(channel: string, listener: (...args: any[]) => void): void
    handle(channel: string, listener: (...args: any[]) => void): void
}

interface Win {
    beforeClose: () => void,
    init: (winId: number) => void,
}

interface Socket {
    close(): Promise<void>
    invoke(data: string | Uint8Array): Promise<any>
}

declare global {
    const win: Win
    const contextBridge: Electron.ContextBridge
    const ipcRenderer: Electron.IpcRenderer
    const webFrame: Electron.WebFrame
    const webUtils: Electron.WebUtils

    const server: (name: string, listener?: (socket: Socket) => void) => void
    const connect: (name: string) => Socket
    const subscribe: (type: string, receiver?: (val: any) => void) => Socket
    const unlink: (name: string) => void

    const invoker: InvokerServer
}