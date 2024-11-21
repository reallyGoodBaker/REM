import { SvelteComponent } from "svelte"

interface PagerContext {
    name: string
    class: SvelteComponent
    props: any
    save: any
}

interface SearchHandler {
    (str: string): void
}

type ConstructorOf<T> = new (...args: any[]) => T

interface Pager {
    add(name: string, component: SvelteComponent, props?: any, force?: boolean): boolean
    select(key: string | number, forceUpdate?: boolean): void
    remove(key: string | number): void
    has(key: string | number): boolean
    openNew(name: string, component: ConstructorOf<SvelteComponent>, props?: any, force?: boolean): void
    getContext(): PagerContext
    beforeSwitch(handler: () => void): void
    size(): number
    index(): number
    removeByIndex(i: number): void
    removeCurrent(): void
    setOnSearch(handler: SearchHandler): void
    setOnSearchInput(handler: SearchHandler): void
    setSearchPlaceholder(placeholder: string): void
    performSearch(str: string): void
    performSearchInput(str: string): void
    clearSearchListeners(): void
    next(): void
    prev(): void
}

declare global {
    const Pager: Pager

    interface PromiseConstructor {
        withResolvers<T>(): {
            promise: Promise<T>
            resolve: (value: T) => void
            reject: (reason: any) => void
        }
    }
}
