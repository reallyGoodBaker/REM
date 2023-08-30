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
 * 为 `ExtensionHost` 提供跨进程调用的函数
 */
export const provide: (name: InternalProvideKeys, handler: (...args: readonly TransferListItem[]) => any) => void

export const ready: () => Promise<boolean>
export const whenReady: (cb: Function) => void