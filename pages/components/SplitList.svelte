<script>
    import SplitTile from "./SplitTile.svelte";
    import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
    import LoadingCircle from './LoadingCircle.svelte'
    import SplitTileArtist from './SplitTileArtist.svelte'
    import SplitTileAlbum from "./SplitTileAlbum.svelte"
    import SplitTileTitle from "./SplitTileTitle.svelte"
    import VirtualList from "./VirtualList.svelte"
    import RecyclerScrollView from "./RecyclerScrollView.svelte";

    let emit = createEventDispatcher();

    export let listData = []
    export let location = []
    export let selections = new Set()
    export let focus = -1
    export let components = [, SplitTileTitle, SplitTileArtist, SplitTileAlbum]

    $: list = listData.map((item, index) => {item.i = index; return item})

    function onClick(i) {
        emit('click', {listData, i});
    }

    function dbClick(i) {
        emit('dbclick', {listData, i});
    }

    onMount(() => {
        emit('mount');
    })

    afterUpdate(() => {
        if (listData.length > 0) {
            emit('update')
        }
    })

</script>

{#if listData.length}
<RecyclerScrollView
    templateHeight={56}
    count={listData.length}
    getItem={i => listData[i]}
    let:item={data}
>
    <SplitTile
        data={[
            data.i + 1,
            { title: data.name, picUrl: data.al.picUrl },
            data.ar,
            data.al,
        ]}
        {components}
        bind:location
        on:click={() => onClick(data.i)}
        on:dbclick={() => dbClick(data.i)}
        selected={selections.has(data.i)}
        focus={~focus && focus}
    />
</RecyclerScrollView>

{:else}
<div class="Column" style="width: 100%; margin-top: 20px">
    <LoadingCircle
        strokeStyle={window.getComputedStyle(
            document.body
        ).getPropertyValue('--controlDark')}
        size={20}
        lineWidth={3}
        transformationDelay={300}
        transformDuration={300}/>
</div>
{/if}

