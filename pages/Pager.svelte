<script>
    import Blank from "./Blank.svelte"
    import { anim } from '../utils/anims.js'
    import { onMount } from "svelte"
    import { rem } from '../utils/rem.js'


    let _page = Blank
    let _props = {}

    function _display(page, props) {
        if (_page === page) {
            _page = Blank
            _props = props
            setTimeout(() => {
                _page = page;
            })
            return
        }

        _props = props
        _page = page
    }

    let innerWindow

    export async function display(page, props, isBack=false) {
        await anim(innerWindow, [
            {opacity: 1, transform: 'scale(1)'},
            {opacity: 0, transform: `scale(${isBack? 0.96: 1.06})`}
        ], {
            duration: 60,
            ease: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
            fill: 'forwards'
        })

        _display(page, props)

        requestIdleCallback(async () => {
            await anim(innerWindow, [
                {opacity: 0, transform: `scale(${isBack? 1.06: 0.96})`},
                {opacity: 1, transform: 'scale(1)'}
            ], {
                duration: 80,
                ease: 'cubic-bezier(0.19, 1, 0.22, 1)',
                fill: 'forwards'
            })

            rem.emit('pageSwipeAnimFinish')
        })
    }

    onMount(() => {
        new MutationObserver(() => {
            rem.emit('pageContentChange')
        }).observe(innerWindow, {childList: true, subtree: true, attributes: false})
    })
    
</script>


<style>
    .container {
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
    <div class="innerWindow row" bind:this={innerWindow}>
        <svelte:component this={_page} {..._props}/>
    </div>
    <!-- {#each pages as {component, computedProps}}
    <div class="innerWindow row" bind:this={innerWindow}>
        <svelte:component this={component} {...computedProps}/>
    </div>
    {/each} -->
</div>
