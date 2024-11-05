<script>
import { onDestroy, onMount } from 'svelte'
import { getImageBitmap } from '../../utils/stores/img'
import { useIntersectionObserver } from '../../utils/intersection'
import { promiseResolvers } from '../../utils/high-level/browser/promise'

export let fit = true
export let width = 64
export let height = 64
export let src = ''
export let radius = '8px'
export let skeletonColor = 'var(--controlGray)'

/**
 * @type {Animation}
 */
let anim
let transfered = false

export async function render(source=src, force=false) {
    if (!force && transfered) {
        return
    }

    const imageBitmap = await getImageBitmap(source, fit ? {
        resizeQuality: 'high',
        resizeWidth: width,
        resizeHeight: height,
    } : undefined)

    ctx.transferFromImageBitmap(imageBitmap)
    transfered = true
    imageBitmap.close()
}

/**
 * @type {HTMLCanvasElement}
 */
let canvas
let ctx
let _unobserve = Function.prototype

async function show() {
    const { promise, resolve } = promiseResolvers()
    anim = canvas.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        fill: 'forwards',
        duration: 400,
        easing: 'ease'
    })
    anim.onfinish = () => {
        resolve()
        anim = null
    }

    return promise
}

onMount(() => {
    ctx = canvas.getContext('bitmaprenderer')
    const { visible, invisible, unobserve } = useIntersectionObserver(canvas)

    visible(source => {
        render(source)
        canvas.style.visibility = 'visible'
        show()
    })
    invisible(() => {
        canvas.style.visibility = 'hidden'
        if (anim) {
            anim.cancel()
            anim = null
        }
    })
    _unobserve = unobserve
})

onDestroy(() => _unobserve())
</script>

<style>
    .container {
        --w: fit-content;
        --h: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--w);
        height: var(--h);
        min-width: var(--w);
        min-height: var(--h);
        overflow: hidden;
    }

    canvas {
        visibility: hidden;
    }
</style>

<div class="container" style="border-radius: {radius}; background-color: {skeletonColor}; --w: {width}px; --h: {height}px">
    <canvas bind:this={canvas} width={width} height={height} style="width: {width}px; height: {height}px"></canvas>
</div>