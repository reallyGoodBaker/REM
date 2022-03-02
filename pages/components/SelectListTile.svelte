<script>
    import { createEventDispatcher } from "svelte";
    import ListTile from "./ListTile.svelte";

    export let dataList = [];
    export let selected = 0;

    const emit = createEventDispatcher();

    function onClick(ev, i) {
        emit('selected', i);
        selected = i;
    }
</script>

<style>
    .btn {
        margin-right: 8px;
        border-color: #888;
    }

    .selected {
        color: #fff;
        background-color: var(--controlColor);
        border-color: transparent;
    }
</style>


<ListTile {...$$props} breakLine={true}>
    <div class="column" style="padding-top: 8px;">
        {#each dataList as data, i}
        <div class="btn outlined{selected === i? ' selected':''}" on:click={ev => onClick(ev, i)} on:mousedown={ev=>ev.stopPropagation()}>{data}</div>
        {/each}
    </div>
</ListTile>