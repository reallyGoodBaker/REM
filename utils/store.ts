import { Writable, writable } from 'svelte/store'

export type Store<T> = [
    Writable<T>,
    (value: any) => void,
    () => T
]

export function useStore<T>(value: T): [
    Writable<T>,
    (value: any) => void,
    () => T
] {
    let _val = value
    const store = writable(_val)
    const setter = (value: any) => {
        _val = value
        store.set(value)
    }
    const getter = () => _val

    return [
        store,
        setter,
        getter,
    ]
}