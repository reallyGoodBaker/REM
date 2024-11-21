import { SvelteComponent } from "svelte"
import { RecyclerViewAdapter, ViewRect } from "./RecyclerView/recyclerViewAdapter"
import { Store } from "../../utils/store"

export type ConstructorOf<T> = new (...args: any[]) => T
export type SvelteRef = { $svelte: WeakRef<SvelteComponent> }

export class SplitListAdapter implements RecyclerViewAdapter {
    _viewHolder: (HTMLElement & SvelteRef)[] = []

    constructor(
        private _data: any[],
        public  recyclerView: SvelteComponent,
        private SplitTile: ConstructorOf<SvelteComponent>,
        private location: any[],
        private selections: Set<any>,
        private focus: Store<number>,
        private components: any[],
        private onClick: (i: number) => void,
        private dbClick: (i: number) => void,
    ) {}

    count() {
        return this._data?.length || 0
    }

    rect(position: number) {
        if (!this._data) {
            return ViewRect.zero()
        }

        return ViewRect.from(
            0,
            position * 56,
            0,
            56
        )
    }

    recycle(_: number, view: HTMLElement) {
        if (this._viewHolder.length > 10) {
            const overflow = this._viewHolder.length - 10
            this._viewHolder.splice(0, overflow)
        }

        this._viewHolder.push(view as (HTMLElement & SvelteRef))
    }

    view(position: number) {
        const free = this._viewHolder.shift()
        if (free) {
            const svelteComponent = free.$svelte.deref()
            if (!svelteComponent) {
                return this.createView(position)
            }

            svelteComponent.$set(this.getProps(position))

            return free
        }

        return this.createView(position)
    }

    createView(position: number) {
        const container = this.containerDiv()
        const tile = new this.SplitTile({
            target: container,
            props: this.getProps(position)
        })

        ;(container as any).$svelte = new WeakRef(tile)

        container.onclick = () => this.onClick(position)
        container.ondblclick = () => this.dbClick(position)

        return container
    }

    getProps(position: number) {
        const item = this._data[position]
        const [ ,, getFocus ] = this.focus

        return {
            data: [
                position + 1,
                { title: item.name, picUrl: item.al.picUrl },
                item.ar,
                item.al,
            ],
            index: position,
            location: this.location,
            components: this.components,
            selected: this.selections.has(position),
            focus: ~getFocus()
        }
    }

    containerDiv() {
        const div = document.createElement("div")
        div.style.width = "100%"
        div.style.height = '56px'
        return div
    }

}
