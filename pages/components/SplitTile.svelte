<script>
    import {createEventDispatcher} from 'svelte';
    import { fade } from 'svelte/transition';

    let emit = createEventDispatcher();

    function onClick(ev) {
        emit('click', ev);
    }

    function dbClick(ev) {
        emit('dbclick', ev);
    }

    export let location = [];
    export let data = [];
    export let selected = false;
    export let focus = false;

    function loc2width(location) {
        let widths = new Array(location.length).fill(0);
        location = [...location];
        location.push(100);
        widths.forEach((el, i, arr) => {
            arr[i] = location[i+1] - location[i];
        });
        return widths;
    }

    let widths = loc2width(location);

</script>


<style>
    .tile {
        box-sizing: border-box;
        width: 100%;
        justify-content: flex-start;
        cursor: default;
        font-size: small;
        user-select: all;
    }

    .t {
        height: 32px;
        line-height: 32px;
        padding: 6px 0px;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
        transition: all 0.08s;
    }

    .tile:nth-child(2n) {
        background-color: rgba(0,0,0,0.04);
    }

    .tile:hover {
        background-color: rgba(0,0,0,0.1);
    }

    .tile.selected {
        background-color: rgba(0,0,0,0.1);
    }

    .tile.focus {
        color: var(--controlColor);
    }
</style>


<div class="column tile{selected?' selected': ''}{focus?' focus': ''}" style="padding-left: {location[0]}%"
    on:click={onClick}
    on:dblclick={dbClick}
>
{#each widths as width, i}
    <div class="t txt" style="width: {width}%">{data[i]}</div>
{/each}
</div>