<script>
    import Blank from "./Blank.svelte"
    import { writable } from "svelte/store"
    import { rem } from '../utils/rem.js'
    import { onMount, tick } from "svelte"

    let _page = writable(Blank)
    let _props = writable({})
    let show = true

    async function _display(page, props) {
        show = false
        _page.set(page)
        _props.set(props)
        await tick()
        show = true
    }

    let innerWindow

    export function idle() {
        const { promise, resolve } = Promise.withResolvers()
        requestIdleCallback(resolve)

        return promise
    }

    let slideDir = 'left'

    export async function display(page, props, isBack=false) {
        slideDir = isBack? 'right': 'left'
        const transition = document.startViewTransition(async () => {
            _display(page, props)
        })

        await tick()
        await idle()
        await transition.finished

        rem.emit('pageSwipeAnimFinish')
    }

    onMount(() => {
        new MutationObserver(() => {
            rem.emit('pageContentChange')
        }).observe(innerWindow, {childList: true, subtree: true, attributes: false})
    })
    
</script>


<style>
    .container {
        contain: paint;
        width: 100vw;
        height: calc(100vh - 160px);
        overflow: visible;
        position: relative;
        z-index: 0;
    }

    .innerWindow {
        width: 100%;
        height: 100%;
        overflow: visible;
        /* contain: strict;
        content-visibility: auto; */
        position: relative;
    }
</style>

<div class="container row">
    {#if show}
    <div class="innerWindow row pager-{slideDir}" bind:this={innerWindow}>
        <svelte:component this={$_page} {...$_props}/>
    </div>
    {/if}
</div>
