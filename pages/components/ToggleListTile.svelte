<script>
    import { createEventDispatcher } from "svelte";

    import ListTile from "./ListTile.svelte";
    import Toggle from "./Toggle.svelte";

    let emit = createEventDispatcher();
    let t;
    export let checked = false;

    function onToggle(ev) {
        let checked = ev.detail;
        emit('toggle', checked);
    }

</script>

<style>

</style>

<ListTile {...$$props} on:click={() => t.toggle()}>
    <Toggle bind:checked bind:this={t} on:toggle={onToggle}/>
</ListTile>