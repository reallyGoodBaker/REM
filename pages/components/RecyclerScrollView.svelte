<script>
    import { onDestroy, onMount, tick } from "svelte"
    import { vsync } from '../../utils/core/vsync'
    import ScrollView2 from "./ScrollView2.svelte"

    export let templateHeight =  100
    export let count =  0
    export let getItem = index => ({})
    export let height = '100%'

    /** @type {HTMLElement}*/
    let box

    let start = 0,
        end = 0,
        offset = 0

    let templateCount = 0

    function getItems(start, end) {
        const items = []
        for (let i = start; i < end; i++) {
            const item = getItem(i)
            item && items.push(item)
        }
        return items
    }

    let visible = []
    let looper

    async function init(v) {
        templateCount = Math.floor(v.getViewport().getBoundingClientRect().height / templateHeight)

        refreshData()
        await tick()

        looper = vsync(() => {
            const nextStart = Math.ceil(
                (typeof v.offsetTop === 'function' ? v.offsetTop() : v.offsetTop) / templateHeight
            )
            if (nextStart === start) {
                return
            }
            start = nextStart
            refreshData()
        })
    }

    function refreshData() {
        const _end = start + templateCount + 2
        end = _end > count ? count : _end
        
        if (start > 0) {
            offset = 1
            visible = getItems(start - 1, end)
            return
        }

        offset = 0
        visible = getItems(start, end)
    }

    let v

    onMount(async () => {
        await init(v)
    })

    const remove = () => {
        looper.cancel()
    }

    Pager.beforeSwitch(remove)
    onDestroy(remove)

</script>
 
<ScrollView2 bind:this={v} cssText="height: {height}">
    <div class="Column" style="width: 100%; padding-top: {(start - offset) * templateHeight}px; padding-bottom: {(count - end) * templateHeight}px;" bind:this={box}>
        {#each visible as item, index}
        <slot {item} {index}/>
        {/each}
    </div>
</ScrollView2>