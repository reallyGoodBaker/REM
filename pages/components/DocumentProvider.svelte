<script>
    import { onDestroy, onMount } from "svelte"

    let container

    export let conf = {}

    onMount(() => {
        conf?.onMount?.(container)
    })

    onDestroy(() => {
        conf?.onDestroy?.()
    })
</script>

<style>
    .container {
        width: 100%;
        height: 100%;
    }
</style>

<div class="container" bind:this={container}></div>