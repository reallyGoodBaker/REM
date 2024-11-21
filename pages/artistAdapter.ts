import { SvelteComponent } from "svelte"
import { RecyclerViewAdapter, ViewRect } from "./components/RecyclerView/recyclerViewAdapter"
import { ConstructorOf, SvelteRef } from "./components/splitListAdapter"

export class ArtistAdapter implements RecyclerViewAdapter {
    constructor(
        private _data: any[],
        private ArtistCard: ConstructorOf<SvelteComponent>
    ) { }

    private readonly _viewHolder: (HTMLElement & SvelteRef)[] = []

    count(): number {
        return this._data.length / 2
    }

    rect(position: number): ViewRect {
        return ViewRect.from(
            0,
            160 * position,
            0,
            160,
        )
    }

    recycle(_: number, view: HTMLElement): void {
        if (this._viewHolder.length > 10) {
            const overflow = this._viewHolder.length - 10
            this._viewHolder.splice(0, overflow)
        }

        this._viewHolder.push(view as (HTMLElement & SvelteRef))
    }

    private container(): HTMLElement {
        const container = document.createElement("div")
        container.style.width = "100%"
        container.style.height = '160px'
        
        return container
    }

    private getProps(position: number): any {
        return {
            als: [
                this._data[2 * position],
                this._data[2 * position + 1]
            ]
        }
    }

    private createView(position: number): HTMLElement {
        const view = this.container()
        const card = new this.ArtistCard({
            target: view,
            props: this.getProps(position)
        })

        ;(view as any).$svelte = new WeakRef(card)

        return view
    }

    view(position: number): HTMLElement {
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

}