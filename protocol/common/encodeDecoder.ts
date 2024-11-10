export interface EncodeDecoder<V> {
    encode(data: V): Uint8Array|Buffer
    decode(data: Uint8Array|Buffer): V
}

export function encodeDecoder<V>(
    encoder: (data: V) => Buffer,
    decoder: (data: Buffer) => V
): EncodeDecoder<V> {
    return {
        encode: encoder,
        decode: decoder,
    }
}

export function messageEncode(type: number, uri: string, data: Buffer) {
    return Buffer.concat([
        Buffer.from([type]) as any,
        Buffer.from(uri + '\0', 'utf8'),
        data,
    ])
}

export function messageDecode(data: Buffer) {
    const type = data[0]
    const uriEnd = data.indexOf(0, 1)
    const uri = data.subarray(1, uriEnd).toString('utf8')
    const payload = data.subarray(uriEnd + 1)
    return { type, uri, payload }
}