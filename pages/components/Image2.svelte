<script>
    import { rem } from '../../utils/rem.js';
    import { onMount, onDestroy } from "svelte"
    import { getImageBitmap, imageDecodeQueue } from "../../utils/stores/img"

    export let fit = false
    export let src = ''
    export let width = 64
    export let height = 64
    export let radius = '8px'
    export let borderWidth = '2px'
    export let borderColor = 'var(--controlGray)'
    export let skeletonColor = 'var(--controlGray)'

    $: draw(src)

    let container
        ,/**@type {HTMLCanvasElement}*/ canvas
        ,/**@type {CanvasRenderingContext2D}*/ ctx
        ,/**@type {ImageBitmap}*/ bitmap

    function initCtx() {
        ctx = canvas.getContext('2d')
        imageDecodeQueue.watch(container, draw, clear)
    }

    export async function draw(url=src) {
        if (!url || !ctx) return

        ctx.drawImage(bitmap = await getImageBitmap(url, fit ? {
            resizeWidth: width,
            resizeHeight: height,
            resizeQuality: 'high',
        } : undefined), 0, 0)
    }

    export async function clear() {
        // ctx?.clearRect(0, 0, width, height)
        bitmap?.close()
    }

    onMount(async() => {
        initCtx()
        rem.on('win:focus', draw)
        await draw()
    })

    const unobserve = () => {
        if (container) {
            imageDecodeQueue.unwatch(container)
            rem.off('win:focus', draw)
        }
    }

    Pager.beforeSwitch(unobserve)
    onDestroy(unobserve)
</script>

<div
    bind:this={container}
    class="c"
    style="background-color: {skeletonColor}; width: {width}px; height: {height}px; border-radius: {radius}; border: solid {borderWidth} {borderColor};">
    <canvas
        {width}
        {height}
        style="width: {width}px; height: {height}px;"
        bind:this={canvas}></canvas>
</div>

<style>
    .c {
        box-sizing: border-box;
        overflow: hidden;
    }
</style>