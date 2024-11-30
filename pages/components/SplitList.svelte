<script>
    import SplitTile from "./SplitTile.svelte"
    import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
    import LoadingCircle from './LoadingCircle.svelte'
    import SplitTileArtist from './SplitTileArtist.svelte'
    import SplitTileAlbum from "./SplitTileAlbum.svelte"
    import SplitTileTitle from "./SplitTileTitle.svelte"
    import { SplitListAdapter } from './splitListAdapter'
    import RecyclerView2 from "./RecyclerView/RecyclerView2.svelte"
    import { useStore } from '../../utils/store'

    let emit = createEventDispatcher()

    export let listData = Promise.resolve([])
    export let location = []
    export let selections = new Set()
    export let focus = -1
    export let components = [, SplitTileTitle, SplitTileArtist, SplitTileAlbum]

    let focusWritable = useStore(focus)
    function updateFocus(f) {
        focusWritable[1](f)
    }

    $: updateFocus(focus)

    async function onClick(i) {
        emit('click', {listData: await listData, i})
    }

    async function dbClick(i) {
        emit('dbclick', {listData: await listData, i})
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
<div class="Column" style="width: 100% margin-top: 20px">
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
<RecyclerView2
    height='100%'
    adapter={new SplitListAdapter(
        list,
        SplitTile,
        location,
        selections,
        focusWritable,
        components,
        onClick,
        dbClick,
    )}
/>
{/await}

