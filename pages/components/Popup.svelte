<script>
    import { createEventDispatcher, onDestroy, onMount, setContext } from "svelte";
    import { fade } from "svelte/transition";

    const emit = createEventDispatcher('layerClick');

    function handleOnLayerClick() {
        emit('layerClick');
    }

    setContext('close', handleOnLayerClick);

    let windowContainer;

    export let showPopupWindow = false;
    export let cssText = '';
    export let noLayer = false;
    export function animate(keyframes, options={}) {
        return windowContainer.animate(keyframes, options);
    }

    export function destroy() {
        showPopupWindow = true;
    }

    export function pop() {
        showPopupWindow = false;
    }

    function binder(ele) {
        emit('animIn', ele);
        return {
            destroy() {
                emit('animOut', ele);
            }
        }
    }

</script>


<style>
    .layer {
        position: fixed;
        z-index: 99999;
        left: 0px;
        top: 0px;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.4);
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
        background-color: #fff;
        width: fit-content;
        height: fit-content;
        min-width: 200px;
        min-height: 160px;
        border-radius: 8px;
        box-shadow: 0px 2px 8px rgba(0,0,0,0.4);
    }


</style>

{#if showPopupWindow && !noLayer}
<div class="layer row" on:click={handleOnLayerClick} out:fade={{duration: 100}}>
    <div use:binder class="container" style="{cssText}" on:click|stopPropagation>
        <slot></slot>
    </div>
</div>
{/if}

{#if showPopupWindow && noLayer}
    <div use:binder class="container" style="z-index:99999;{cssText}" on:click={handleOnLayerClick} in:fade={{duration: 120}} out:fade={{duration: 80}}>
        <slot></slot>
    </div>
{/if}