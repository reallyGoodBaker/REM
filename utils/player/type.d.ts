interface AudioPlayerAdapter {
    load(source: any): Promise<boolean>
    play(): Promise<void>
    pause(): Promise<void>
    stop(): void
    seek(time: number): void
    currentTime(): number
    playing(): boolean
    outputNode(): AudioNode
}