export interface IConsumer {
    read(uri: string): Promise<Buffer>
    write(uri: string, value: Buffer): Promise<void> | void
    delete(uri: string): Promise<void> | void
}