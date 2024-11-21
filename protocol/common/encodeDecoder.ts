export interface EncodeDecoder<V> {
    encode(data: V): Uint8Array
    decode(data: Uint8Array): V
}

export function encodeDecoder<V>(
    encoder: (data: V) => Uint8Array,
    decoder: (data: Uint8Array) => V
): EncodeDecoder<V> {
    return {
        encode: encoder,
        decode: decoder,
    }
}

export const noneEncodeDecoder: EncodeDecoder<any> = {
    encode: (data) => data,
    decode: (data) => data,
}

export enum MessageType {
    READ,
    WRITE,
    DELETE,
    RETURN,
}

export interface Message {
    type: MessageType
    uri: string
    payload: Buffer
}

export function messageEncode({ type, uri, payload }: Message) {
    return Buffer.concat([
        Buffer.from([type]) as any,
        Buffer.from(uri + '\0', 'utf8'),
        payload,
    ])
}

export function messageDecode(data: Buffer): Message {
    const type = data[0]
    const uriEnd = data.indexOf(0, 1)
    const uri = data.subarray(1, uriEnd).toString('utf8')
    const payload = data.subarray(uriEnd + 1)
    return { type, uri, payload }
}