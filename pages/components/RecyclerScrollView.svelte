<script>
    import { onDestroy, onMount, tick } from "svelte"
    import { vsync } from '../../utils/core/vsync'
    import ScrollView2 from "./ScrollView2.svelte"
    import { createEventDispatcher, get_current_component } from "svelte/internal"

    const component = get_current_component()
    const emit = createEventDispatcher()
    const removeEventHandlers = []

    function setupEvent(dom) {
        const remove = events({
            recyclerView: component,
            itemView: dom
        }, {
            emit,
            /**@type {(ev: Event)=>number}*/
            index: ev => {
                if (!ev.composedPath().indexOf(dom)) {
                    return -1
                }

                const i = Array.from(children).indexOf(dom)
                if (i === -1) {
                    return i
                }

                return i + start
            }
        })

        removeEventHandlers.push(remove)
    }

    export let templateHeight =  100
    export let count =  0
    export let getItem = index => ({})
    export let height = '100%'
    export let template = null
    export let getProps = (item) => ({})
    
    /**
     * @param target {RecyclerEventTargets}
     * @param ctx {RecyclerContext}
     */
    export let events = (target, ctx) => {}

    /** @type {HTMLElement}*/
    let box
    let start = 0,
        end = 0

    let templateCount = 0

    async function getItems() {
        await tick()
        const items = []
        const _e = end
        for (let i = start; i < _e; i++) {
            const item = getItem(i)
            item && items.push(item)
        }
        return items
    }

    let looper
    let children
    let childComponents = new Map()
    let lastY = 0
    let needRecycle = true

    function getYOffset() {
        if (!v) {
            return 0
        }

        return typeof v.offsetTop === 'function' ? v.offsetTop() : v.offsetTop
    }

    async function init(v) {
        templateCount = Math.ceil(v.getViewport().getBoundingClientRect().height / templateHeight)
        end = Math.min(count, start + templateCount + 1)

        if (templateCount >= count) {
            needRecycle = false
        }

        let renderCurrentTick = true

        await firstRender()
        await tick()

        looper = vsync(async () => {
            if (!needRecycle) {
                return
            }

            const yOffset = getYOffset()
            const dy = yOffset - lastY
            // 可视区域内第一个元素的下标
            const newStart = calcStart((lastY = yOffset), dy)

            if (renderCurrentTick) {
                renderCurrentTick = false
                await refreshData(newStart, start, dy < 0)
                renderCurrentTick = true
            }
        })
    }

    function calcStart(yOffset, dy) {
        if (!dy) {
            return start
        }

        return Math.min(
            Math.max(0, Math.floor(yOffset / templateHeight)),
            count - templateCount - 1
        )
    }

    async function firstRender() {
        let components = []
        for (const item of await getItems()) {
            const component = new template({
                target: box,
                props: getProps(item),
            })

            components.push(component)
        }
    
        await tick()
        children = box.children

        let i = 0
        for (const child of children) {
            setupEvent(child)
            childComponents.set(child, components[i++])
        }
    }

    function forceUpdate(itemList) {
        let i = 0
        const childComponentList = Array.from(childComponents.values())
        for (const item of itemList) {
            const component = childComponentList[i++]
            component?.$set(getProps(item))
        }
    }

    function recycleScrollDown(count, itemList) {
        for (let i = count; i--;) {
            const first = children[0]
            const component = childComponents.get(first)
            box.appendChild(first)
            const newVal = getProps(itemList.at(i - count))
            component.$set(newVal)
        }
    }

    function recycleScrollUp(count, itemList) {
        for (let i = count; i--;) {
            const last = children[children.length - 1]
            const component = childComponents.get(last)
            box.insertBefore(last, box.firstChild)
            const newVal = getProps(itemList.at(i))
            component.$set(newVal)
        }
    }

    async function refreshData(newStart, oldStart, unshift) {
        const startOffset = newStart - oldStart
        if (!startOffset) {
            const offset = unshift ? -1 : 1
            
            if (unshift) {
                recycleScrollUp(-1, itemList)
            } else {
                recycleScrollDown(1, itemList)
            }

            return
        }

        start = newStart
        end = start + templateCount + 1

        const itemList = await getItems()
        if (Math.abs(startOffset) > templateCount) {
            forceUpdate(itemList)
            return
        }

        if (startOffset > 0) {
            recycleScrollDown(startOffset, itemList)
        } else {
            recycleScrollUp(-startOffset, itemList)
        }
    }

    let v

    onMount(async () => {
        await init(v)
    })

    const remove = () => {
        looper.cancel()
        removeEventHandlers.forEach(v => v?.())
    }

    Pager.beforeSwitch(remove)
    onDestroy(remove)

    /**
     * @typedef {RecyclerEventTargets}
     * @property {SvelteComponent} recyclerView
     * @property {HTMLElement} itemView
     */

    /**
     * @typedef {RecyclerContext}
     * @property {<EventKey extends string>(type: EventKey, detail?: any, options?: DispatchOptions) => boolean} emit
     * @property {(ev: Event) => number} index
     */
</script>

<ScrollView2 bind:this={v} cssText="height: {height}">
    <div
        class="Column"
        style="width: 100%; padding-top: {start * templateHeight}px; padding-bottom: {(count - end) * templateHeight}px;"
        bind:this={box}
    />
</ScrollView2>