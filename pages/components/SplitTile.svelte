<script>
    import {createEventDispatcher} from 'svelte'
    import SplitTileText from './SplitTileText.svelte'

    let emit = createEventDispatcher()

    function onClick(ev) {
        emit('click', ev)
    }

    function dbClick(ev) {
        emit('dbclick', ev)
    }

    export let location = []
    export let data = []
    export let selected = false
    export let focus = false
    export let components = []
    export let index = 0

    function loc2width(location) {
        let widths = new Array(location.length).fill(0)
        location = [...location]
        location.push(100)
        widths.forEach((el, i, arr) => {
            arr[i] = location[i+1] - location[i]
        })
        return widths
    }

    let widths = loc2width(location)

</script>


<style>
    .tile {
        width: calc(100% - 48px);
        padding: 0 24px;
        justify-content: flex-start;
        cursor: default;
        font-size: small;
        user-select: none;
    }

    .t {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 56px;
        padding: 6px 0px;
        padding-left: 6px;
        transition: all 0.08s;
    }

    .tile.even {
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


<div class="Row c tile{selected?' selected': ''}{focus?' focus': ''} {index % 2 ? 'even' : ''}"
    on:click={onClick}
    on:dblclick={dbClick}
>
{#each widths as width, i}
    <div class="t txt" style="width: {width}%;">
        <svelte:component this={components[i] ?? SplitTileText} data={data[i]}/>
    </div>
{/each}
</div>