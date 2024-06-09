<script>
    import { createEventDispatcher } from "svelte"
    import ListTile from "./ListTile.svelte"

    export let dataList = []
    export let selected = 0
    export let autoSelect = true

    const emit = createEventDispatcher()

    function onClick(ev, i) {
        if (selected === i) {
            return
        }

        emit('selected', i)
        if (autoSelect) {
            selected = i
        }
    }
</script>

<style>
    .btn {
        margin: 8px 8px 0 0;
        border-color: var(--controlDarker);
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


<ListTile {...$$props} bold={true} breakLine={true}>
    <div class="Row container">
        {#each dataList as data, i}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="btn outlined{i === 0? ' first-child': ''}{selected === i? ' selected':''}" on:click={ev => onClick(ev, i)} on:mousedown={ev => ev.stopPropagation()}>
            {data.label || data}
        </div>
        {/each}
    </div>
</ListTile>