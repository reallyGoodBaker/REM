type RemoveNotGetter<T> = { [K in keyof T as K extends `get${string}` ? K : never]: T[K] }
type RemoveGetPrefix<T> = keyof T extends `get${infer U}` ? U : never
export type DataViewTypes = RemoveGetPrefix<RemoveNotGetter<DataView>>
export type StructDataTypes = DataViewTypes | `byte${number}` | 'string'

export interface StructDescriptor {
    layout(): StructDataTypes[]
}

export interface Mem {
    get(): any[]
    getBytes(): ArrayBuffer
    set(buffer: ArrayBuffer): void
    setUint8Array(u8arr: Uint8Array): void
    setArray(obj: any[]): void
}

export function sizeof(struct: StructDescriptor) {
    const layout = struct.layout()
    let size = 0
    for (const type of layout) {
        size += calcPartSize(type)
    }
    return size
}

const TypeSize: { [key in DataViewTypes]: number } = {
    Float32: 4,
    Float64: 8,
    Int8: 1,
    Int16: 2,
    Int32: 4,
    Uint8: 1,
    Uint16: 2,
    Uint32: 4,
    BigInt64: 8,
    BigUint64: 8
}

function calcPartSize(type: StructDataTypes) {
    if (type ==='string') {
        return 0
    }

    if (type.startsWith('byte')) {
        return parseInt(type.slice(4))
    }

    return TypeSize[type as DataViewTypes]
}

class Acc{
    v = 0

    inc(n=1) {
        const pre = this.v
        this.v += n
        return pre
    }
}

class Memory implements Mem {

    private buffer: ArrayBuffer = new ArrayBuffer(0)
    private readonly partSize: number[] = []
    private _dynamicSize = false

    constructor(
        public readonly struct: StructDescriptor,
    ) {
        struct.layout().forEach(type => {
            this.partSize.push(calcPartSize(type))
            if (type === 'string') {
                this._dynamicSize = true
            }
        })

        if (!this._dynamicSize) {
            this.buffer = new ArrayBuffer(sizeof(struct))
        }
    }

    realloc(newSize: number) {
        const newBuffer = new ArrayBuffer(newSize)
        new Uint8Array(newBuffer).set(new Uint8Array(this.buffer))
        return this.buffer = newBuffer
    }

    getBytes(): ArrayBuffer {
        return this.buffer
    }

    get() {
        const acc = new Acc()
        const layout = this.struct.layout()
        const textDecoder = new TextDecoder()
        const result: any[] = []

        for (let i = 0; i < layout.length; i++) {
            const type = layout[i]
            const size = this.partSize[i]

            if (type === 'string') {
                result.push(this._readString(textDecoder, this.buffer, acc))
                continue
            }

            if (type.startsWith('byte')) {
                result.push(this._readBytes(this.buffer, acc, size))
                continue
            }

            result.push(
                this._readDV(this.buffer, acc, type as DataViewTypes, size)
            )
        }

        return result
    }

    set(buffer: ArrayBuffer): void {
        this.buffer = buffer
    }

    setUint8Array(u8arr: Uint8Array) {
        this.buffer = u8arr.buffer.slice(u8arr.byteOffset, u8arr.byteOffset + u8arr.byteLength) as ArrayBuffer
    }

    setArray(obj: any[]) {
        const acc = new Acc()
        const layout = this.struct.layout()
        const textEncoder = new TextEncoder()

        for (let i = 0; i < layout.length; i++) {
            const type = layout[i]
            const size = this.partSize[i]
            const value = obj[i]

            if (type === 'string') {
                this._writeString(textEncoder, this.buffer, acc, value as string)
                continue
            }

            if (type.startsWith('byte')) {
                this._writeBytes(this.buffer, acc, value as ArrayBuffer, size)
                continue
            }

            this._writeDV(this.buffer, acc, value as number, type as DataViewTypes, size)
        }
    }

    private _ensureMem(size: number) {
        if (this._dynamicSize && this.buffer.byteLength < size) {
            return this.realloc(size)
        }

        return this.buffer
    }

    private _writeString(textEncoder: TextEncoder, buffer: ArrayBuffer, acc: Acc, str: string) {
        const u8arr = textEncoder.encode(str)
        const bytelen = u8arr.length

        buffer = this._ensureMem(acc.v + 4 + bytelen)
        new DataView(buffer).setUint32(acc.v, bytelen)
        new Uint8Array(buffer).set(u8arr, acc.v + 4)
        acc.inc(4 + bytelen)
    }

    private _readString(textDecoder: TextDecoder, buffer: ArrayBuffer, acc: Acc) {
        const bytelen = new DataView(buffer).getUint32(acc.v)
        const u8arr = new Uint8Array(buffer, acc.v + 4, bytelen)
        acc.inc(4 + bytelen)
        return textDecoder.decode(u8arr)
    }

    private _writeBytes(buffer: ArrayBuffer, acc: Acc, bytes: ArrayBuffer, size: number) {
        buffer = this._ensureMem(acc.v + size)
        new Uint8Array(buffer).set(new Uint8Array(bytes).subarray(0, size), acc.v)
        acc.inc(size)
    }

    private _readBytes(buffer: ArrayBuffer, acc: Acc, size: number) {
        const bytes = new Uint8Array(buffer, acc.v, size)
        acc.inc(size)
        return bytes
    }

    private _writeDV(buffer: ArrayBuffer, acc: Acc, value: number, type: DataViewTypes, size: number) {
        buffer = this._ensureMem(acc.v + size)
        new DataView(buffer)[`set${type as DataViewTypes}`](acc.v, value as never)
        acc.inc(size)
    }

    private _readDV(buffer: ArrayBuffer, acc: Acc, type: DataViewTypes, size: number) {
        const value = new DataView(buffer)[`get${type as DataViewTypes}`](acc.v)
        acc.inc(size)
        return value
    }
}

export function malloc(struct: StructDescriptor): Mem {
    return new Memory(struct)
}