<script>
    import { onDestroy, onMount } from 'svelte';
    import { rem } from '../../utils/rem.js';
    import { getImgSrc, removeImageCache, imageDecodeQueue } from '../../utils/stores/img.js'

    export const alt = ''
    export let src = ''
    export let width = 64
    export let height = 64
    export let radius = '8px'
    export let borderWidth = '2px'
    export let borderColor = 'var(--controlGray)'
    export let skeletonColor = 'var(--controlGray)'

    let container

    const img = new Image(width, height)
    img.draggable = false
    img.alt = alt
    img.style.opacity = 1

    function fadeInImage() {
        return new Promise(res => {
            img.animate([
                {opacity: 0},
                {opacity: 1}
            ], {duration: 200, fill: 'forwards'})
            .onfinish = () => res()
        })
    }

    async function _showImage() {
        try {
            await img.decode()
        } finally {
            if (container) {
                container.appendChild(img)
                await fadeInImage()
            }
        }
    }

    export async function loadImage() {
        if (!src || !container) {
            return
        }

        img.src = await getImgSrc(src)

        imageDecodeQueue.watch(container, _showImage, () => img.remove())
    }

    onMount(async () => {
        await loadImage()
        rem.on('win:focus', loadImage)
    })

    const unobserve = () => {
        removeImageCache(src)
        if (container) {
            imageDecodeQueue.unwatch(container)
            rem.off('win:focus', loadImage)
        }
    }

    Pager.beforeSwitch(unobserve)
    onDestroy(unobserve)

</script>

<style>
    .c {
        flex-shrink: 0;
        overflow: hidden;
    }
</style>

<div
    class="Column c" bind:this={container}
    style="background-color: {skeletonColor}; width: {width}px; height: {height}px; border-radius: {radius}; border: solid {borderWidth} {borderColor};"
></div>