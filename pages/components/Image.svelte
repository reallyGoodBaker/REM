<script>
    import { onDestroy, onMount } from 'svelte';
    import { getImgSrc } from '../../utils/stores/img.js'

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

    async function loadImage() {
        img.src = await getImgSrc(src)

        await img.decode()
        container.appendChild(img)
    }

    async function refreshImage() {
        img.remove()

        await loadImage()
    }

    onMount(async () => {
        await loadImage()
        hooks.on('win:focus', refreshImage)
    })

    onDestroy(() => {
        hooks.off('win:focus', refreshImage)
    })

</script>

<style>
    .c {
        overflow: hidden;
    }
</style>

<div
    class="Column c" bind:this={container}
    style="background-color: {skeletonColor}; width: {width}; height: {height}; border-radius: {radius}; border: solid {borderWidth} {borderColor};"
></div>