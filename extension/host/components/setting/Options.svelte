<script>
    import { createEventDispatcher } from "svelte"
    import Toggle from "../../../../pages/components/Toggle.svelte"

    const emit = createEventDispatcher()

    export let label = ''
    export let checked = false
</script>

<style>
    .container {
        height: 32px;
        justify-content: space-between;
        width: 100%;
    }
</style>

<div class="Row container">
    <div>{label}</div>
    <Toggle bind:checked on:toggle={ev => emit('toggle', ev.detail)}/>
</div>