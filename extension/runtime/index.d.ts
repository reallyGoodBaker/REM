interface NotificationControlOptions {
    label: string
    icon: string
    onClick: () => void
}

interface NotificationOptions {
    title?: string
    icon?: string
    message?: string
    timeout?: number
    controls?: NotificationControlOptions[]
    channel?: string,
    onCancel?: () => void
    onConfig?: () => void
}

interface Notification {
    send(n: NotificationOptions): Promise<void>
}

export const notification: Notification

interface BackgroundPlayerController {
    play(): Promise<void>
    pause(): void
    isPlaying(): Promise<boolean>
    duration(): Promise<number>
    seek(time: number): Promise<void>
    seek(): Promise<number>
    metadata(): Promise<any>
    audioData(): Promise<any>
}

export const player: BackgroundPlayerController

interface BackgroundPlaylist {
    next(): void
    previous(): void
}

export const playlist: BackgroundPlaylist

interface TimeoutConstructor {
    cancelAll(): void
    new(): Timeout
}

interface Timeout {
    cancel(): void
}

export const timeout: (callback: () => void, timeout?: number) => Timeout
export const interval: (callback: () => void, t?: number) => Timeout

import type { TransferListItem } from 'node'

export const invoke: (name: string, ...args: readonly TransferListItem[]) => Promise<TransferListItem>
export const call: (name: string, ...args: readonly TransferListItem[]) => void

type InternalProvideKeys = 'beforeDisable' | 'clearTimers' | 'ready'

/**
 * 为 `ExtensionHost` 提供跨线程调用的函数
 */
export const provide: (name: InternalProvideKeys, handler: (...args: readonly TransferListItem[]) => any) => void

export const ready: () => Promise<boolean>
export const whenReady: (cb: Function) => void

interface Win {
    openWindow(file: string, options: Electron.BrowserWindowConstructorOptions): Promise<string>
    closeWindow(id: string): Promise<void>
}

export const win: Win

interface Socket {
    close(): Promise<void>
    invoke(data: string | Uint8Array): Promise<any>
}

interface Ipc {
    server(name: string, listener?: (socket: net.Socket) => void): void
    connect(name: string): Socket
    subscribe(type: string, receiver?: (val: any) => void): Socket
    unlink(name: string): void
    registerPcmStreamReceiver: (receiver?: (buf: Buffer) => void) => Socket
}

export const ipc: Ipc

interface AudioOutputDevice {
    readonly deviceId: string
    readonly label: string
}

interface Output {
    device(): Promise<AudioOutputDevice>
    pluginOutput(): Promise<boolean>
}

export const output: Output