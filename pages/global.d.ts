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

interface Pager {
      add(name: string, component: SvelteComponent, props={}, force=false): boolean
      select(key: string | number, forceUpdate=false): void
      remove(key: string | number): void
      has(key: string | number): boolean
      openNew(name: string, component: SvelteComponent, props={}, force=false): void
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
}

declare global {
      const Pager: Pager
}
