<script>
    import SplitTile from "./SplitTile.svelte";
    import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
    import LoadingCircle from './LoadingCircle.svelte'
    import SplitTileArtist from './SplitTileArtist.svelte'
    import SplitTileAlbum from "./SplitTileAlbum.svelte"
    import SplitTileTitle from "./SplitTileTitle.svelte"
    import RecyclerScrollView from "./RecyclerScrollView.svelte";

    let emit = createEventDispatcher();

    export let listData = Promise.resolve([])
    export let location = []
    export let selections = new Set()
    export let focus = -1
    export let components = [, SplitTileTitle, SplitTileArtist, SplitTileAlbum]

    async function onClick(i) {
        emit('click', {listData: await listData, i});
    }

    async function dbClick(i) {
        emit('dbclick', {listData: await listData, i});
    }

    onMount(async () => {
        emit('mount')
    })

    afterUpdate(async () => {
        if ((await listData).length > 0) {
            emit('update')
        }
    })

</script>

{#await listData}
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
{:then list} 
<RecyclerScrollView
    templateHeight={56}
    count={list.length}
    getItem={i => Object.assign(list[i], { i })}
    let:item={data}
>
    <SplitTile
        data={[
            data.i + 1,
            { title: data.name, picUrl: data.al.picUrl },
            data.ar,
            data.al,
        ]}
        index={data.i}
        {components}
        bind:location
        on:click={() => onClick(data.i)}
        on:dbclick={() => dbClick(data.i)}
        selected={selections.has(data.i)}
        focus={~focus && focus}
    />
</RecyclerScrollView>
{/await}

