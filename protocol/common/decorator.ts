import { StructDataTypes } from './struct/struct'

export type ConstructorOf<T> = new (...args: any[]) => T
const STRUCTS = new Map<ConstructorOf<any>, StructDataTypes[]>()

export const Struct = (...desc: StructDataTypes[]) => <V>(target: ConstructorOf<V>) => {
    STRUCTS.set(target, desc)
}

export function getStruct(cls: ConstructorOf<any>) {
    //@ts-ignore
    return STRUCTS.get(cls) ?? cls?.struct?.layout?.()
}
