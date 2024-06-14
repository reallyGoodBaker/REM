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
    interface Window {
        readonly win: Win
        readonly contextBridge: Electron.ContextBridge
        readonly ipcRenderer: Electron.IpcRenderer
        readonly webFrame: Electron.WebFrame
        readonly webUtils: Electron.WebUtils

        readonly server: (name: string, listener?: (socket: Socket) => void) => void
        readonly connect: (name: string) => Socket
        readonly subscribe: (type: string, receiver?: (val: any) => void) => Socket
        readonly registerPcmStreamReceiver: (receiver?: (buf: Buffer) => void) => Socket
        readonly unlink: (name: string) => void

        readonly invoker: InvokerServer
    }
}