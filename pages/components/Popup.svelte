<script>
    import { createEventDispatcher, setContext } from "svelte"
    import { fade } from "svelte/transition"

    const emit = createEventDispatcher()

    function handleOnLayerClick() {
        emit('layerClick')
    }

    setContext('close', handleOnLayerClick)

    let windowContainer

    export let showPopupWindow = false
    export let cssText = ''
    export let noLayer = false
    export let shadowBlurRadius = 8
    export let shadowOffset = 2
    export let layerColor = 'var(--fade)'
    export let layerStyle = ''
    export function animate(keyframes, options={}) {
        return windowContainer.animate(keyframes, options)
    }

    export function destroy() {
        showPopupWindow = true
    }

    export function pop() {
        showPopupWindow = false
    }

    function binder(ele) {
        emit('animIn', ele)
        return {
            destroy() {
                emit('animOut', ele)
            }
        }
    }

</script>


<style>
    .layer {
        -webkit-app-region: no-drag;
        --bgc: var(--fade);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        pointer-events: all;
        position: fixed;
        z-index: 99999;
        left: 0px;
        top: 0px;
        width: 100vw;
        height: 100vh;
        background-color: var(--bgc);
        animation: showPopupWindow 0.12s;
    }

    @keyframes showPopupWindow {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .container {
        --blur-radius: 4px;
        --offset: 1px;
        background-color: transparent;
        width: fit-content;
        height: fit-content;
        min-width: 200px;
        min-height: 160px;
        filter: drop-shadow(0px var(--offset) var(--blur-radius) rgba(0,0,0,0.4));
        contain: paint;
    }


</style>

{#if showPopupWindow && noLayer}
    <div use:binder class="container" style="z-index:99999;{cssText}" on:click={handleOnLayerClick} in:fade={{duration: 120}} out:fade={{duration: 80}}>
        <slot></slot>
    </div>
{/if}

{#if showPopupWindow && !noLayer}
    <div style="--bgc: {layerColor};{layerStyle}" class="layer" on:click|stopPropagation={handleOnLayerClick} out:fade={{duration: 100}}>
        <div use:binder class="container" style="{cssText}; --blur-radius: {shadowBlurRadius}px; --offset: {shadowOffset}px;" on:click|stopPropagation>
            <slot></slot>
        </div>
    </div>
{/if}