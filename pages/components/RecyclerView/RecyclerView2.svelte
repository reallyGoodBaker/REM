<script>
    import { onDestroy, onMount } from "svelte"
    import { vsync } from '../../../utils/core/vsync'
    import ScrollView2 from "../ScrollView2.svelte"
    
    /**
     * @type {import('./recyclerViewAdapter').RecyclerViewAdapter}
     */
    export let adapter = null
    export let orientation = 'vertical'
    export let width = '100%'
    export let height = 'auto'

    let count =  adapter.count()
    let _width = 0
    let _height = 0

    function calcWidth() {
        if (orientation === 'vertical') {
            return '100%'
        }

        let totalWidth = 0
        for (let i = 0; i < count; i++) {
            totalWidth += adapter.rect(i).width
        }

        return totalWidth + 'px'
    }

    function calcHeight() {
        if (orientation === 'horizontal') {
            return '100%'
        }

        let totalHeight = 0
        for (let i = 0; i < count; i++) {
            totalHeight += adapter.rect(i).height
        }

        return totalHeight + 'px'
    }

    function calcDim() {
        _width = calcWidth()
        _height = calcHeight()
    }

    calcDim()

    let scrollView,
        box,
        insights = new Set()

    function getInsightViews() {
        const insightViews = new Set()

        if (!scrollView) {
            return insightViews
        }

        if (orientation === 'vertical') {
            const top = scrollView.offsetTop()
            const winHeight = scrollView.getViewport().getBoundingClientRect().height

            let first, last

            for (let i = 0; i < count; i++) {
                const { y, height } = adapter.rect(i)
                if (y + height > top && y < top + winHeight) {
                    if (first === undefined) {
                        first = i
                    }

                    if (last === undefined) {
                        last = i
                    }

                    insightViews.add(i)
                }
            }

            if (first!== undefined && last!== undefined) {
                insightViews.add(Math.max(first - 1, 0))
                insightViews.add(Math.min(last + 1, count - 1))
            }

            return insightViews
        }
    }

    const indexViewMapping = new Map()

    /**
     * @param insightViews {Set<number>}
     */
    function batchUpdate(insightViews) {
        const newViews = insightViews.difference(insights)
        const old = Array.from(insights.difference(insightViews))
        insights = insightViews

        for (const vi of newViews) {
            const v = adapter.view(vi)
            indexViewMapping.set(vi, v)
            updateView(vi, v, false)
        }

        old.forEach(vi => {
            const v = indexViewMapping.get(vi)
            updateView(vi, v, true)
            indexViewMapping.delete(vi)
        })
    }

    /**
     * @param v {HTMLElement}
     */
    function updateView(i, v, recycle) {
        if (!recycle) {
            const style = v.style
            const { x, y } = adapter.rect(i)

            style.position = 'absolute'
            style.left = x + 'px'
            style.top = y + 'px'
            box.appendChild(v)
            return
        }

        v.remove()
        adapter.recycle(i, v)
    }

    let looper
    onMount(() => {
        looper = vsync(() => {
            batchUpdate(getInsightViews())
        })
    })

    onDestroy(() => {
        looper.cancel()
    })
</script>

<style>
    .box {
        position: relative;
    }
</style>

<ScrollView2 bind:this={scrollView} cssText="height: {height}; width: {width};">
    <div
        class="box"
        style="width: {_width}; height: {_height};"
        bind:this={box}
    />
</ScrollView2>