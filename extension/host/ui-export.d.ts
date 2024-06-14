type ConstructorOf<T> = new (...args: any[]) => T

interface AudioDataValue {
    readonly title: string
    readonly album: any
    readonly artist: any
    readonly id: string
}

interface IAudioData {
    url(): Promise<string>
    title(): string
    album(): any
    artist(): any
    uri(): string
}

interface IAudioPlayer {
    on(type: string, listener: (...args: any[]) => void): void
    play(): Promise<void>
    pause(): Promise<void>
    seek(): number
    seek(time: number): void
    load(source?: string | Uint8Array): Promise<boolean>
    loadData(audioData: AudioDataValue, onload: () => void): Promise<void>
    volume(): number
    volume(v: number): void
    duration(): number
    isPlaying(): number
    getMetadata(): any
}

interface IPlaylist {
    listData: any[]
    current: number

    getAudioData(index?: number): IAudioData
    loadList(list: any[]): void
    getCurrentData(): any
    next(): IAudioData | undefined
    prev(): IAudioData | undefined
    playNext(): void
    playPrev(): void
    play(index?: number): void
    load(index: number): Promise<void>
    playByAudioData(audioData: AudioDataValue): void
}

interface UIHomeRegConf {
    isUrl?: boolean
    avatar: string
    title: string
    onClick: () => void
}

interface UIHome {
    register(conf: UIHomeRegConf): void
    unregister(conf: UIHomeRegConf): void
}

interface Settings {
    get(): Promise<any>
    getRaw(): Promise<any>
    getSync(): any
    set(v: any): Promise<void>
    setRaw(v: any): Promise<void>
    rm(): Promise<void>
}

interface RendererStore {
    get(k: any): Promise<any>
    getRaw(k: any): Promise<any>
    getSync(k: any): any
    set(k: any, v: any): Promise<void>
    setRaw(k: any, v: any): Promise<void>
    rm(k: any): Promise<void>
}

interface UIModules {
    readonly settings: Settings,
    /**
     * Component "audio_player"
     */
    readonly AudioPlayer?: ConstructorOf<IAudioPlayer> & IAudioPlayer
    /**
     * Component "playlist"
     */
    readonly MainPlaylist?: IPlaylist
    /**
     * Component "store"
     */
    readonly store?: RendererStore
}

declare global {
    /**
     * Only for "uiEntry"
     */
    type ExportOnLoad = (mods: UIModules & { home: UIHome }) => void
    /**
     * Only for "uiEntry"
     */
    type ExportOnReady = (mods: UIModules) => void
}