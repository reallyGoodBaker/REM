<script>
    import { createEventDispatcher } from "svelte";

    import ListTile from "./ListTile.svelte";
    import Toggle from "./Toggle.svelte";

    let emit = createEventDispatcher();
    let t;
    export let checked = false;
    export let bold = true

    function onToggle(ev) {
        let checked = ev.detail;
        emit('toggle', checked);
    }

    export let customClickListener = false

    function onClick() {
        if (!customClickListener) {
            t.toggle()
            return
        }

        emit('click')
    }

</script>

<style>

</style>

<ListTile {...$$props} {bold} on:click={onClick}>
    <Toggle bind:checked bind:this={t} on:toggle={onToggle}/>
</ListTile>