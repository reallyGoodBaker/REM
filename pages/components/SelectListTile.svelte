<script>
    import { createEventDispatcher } from "svelte";
    import ListTile from "./ListTile.svelte";

    export let dataList = [];
    export let selected = 0;

    const emit = createEventDispatcher();

    function onClick(ev, i) {
        if (selected === i) {
            return
        }

        emit('selected', i);
        selected = i;
    }
</script>

<style>
    .btn {
        margin: 8px 8px 0 0;
        border-color: #888;
    }

    .container {
        flex-wrap: wrap;
        width: 100%;
    }

    .first-child {
        margin-left: 0;
    }

    .selected {
        color: #fff;
        background-color: var(--controlColor);
        border-color: transparent;
    }
</style>


<ListTile {...$$props} breakLine={true}>
    <div class="Row container">
        {#each dataList as data, i}
        <div class="btn outlined{i === 0? ' first-child': ''}{selected === i? ' selected':''}" on:click={ev => onClick(ev, i)} on:mousedown={ev=>ev.stopPropagation()}>
            {data.label || data}
        </div>
        {/each}
    </div>
</ListTile>