<script>
    import { store } from '../../utils/stores/base'
    import { NETEASE_IMG_LARGE } from '../../utils/stores/img'
    import Playlist from '../Playlist.svelte'
    import Link from './Link.svelte'

    export let als = []

    async function getAlbumDetail(id) {
        let al = await store.get('al' + id)
        if (!al) {
            al = (await NeteaseApi.getAlbumDetail(id, await store.get('cookie'))).body
            store.set('al'+id, al)
        }
        return al
    }
</script>

<style>
    .album-col {
        display: grid;
        gap: 8px;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        box-sizing: border-box;
        width: 100%;
        height: fit-content;
    }

    .album {
        box-sizing: border-box;
        padding: 12px;
        border-radius: 8px;
        display: flex;
        gap: 8px;
        justify-content: flex-start;
        align-items: center;
        height: 160px;
    }
    .album:hover {
        background-color: var(--fadeBright);
    }
    .album:active {
        transform: scale(0.96);
    }

    .album > * {
        flex-shrink: 0;
    }

    .album-title {
        font-weight: bold;
        width: 100%;
        word-break: break-all;
        font-size: larger;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }

    .info {
        width: calc(100% - 148px);
        height: 100%;
        justify-content: space-between;
    }

    .align_start {
        align-items: flex-start;
    }

    .extra {
        font-size: small;
    }
</style>

<div class="album-col">
    {#each als as al}
    {#if al}
    <div class="album" on:click={async () => {
        let id = al.id
        const {album, songs} = await getAlbumDetail(id)
        
        window.Pager.openNew(al.name, Playlist, {
            header: {
                imgUrl: album.picUrl,
                title: album.name,
                artists: album.artists,
                trackCount: album.size,
                desc: album.description,
            },
            listData: songs,
            sortBy: await store.get('playlist/sortBy'),
            forwards: await store.get('playlist/forwards'),
        })
    }}>
        <img draggable="false" width={140} height={140} src={al.picUrl + NETEASE_IMG_LARGE} alt="" style="border-radius: 8px;"/>
        <div class="Column info align_start">
            <div class="Column align_start">
                <div class="album-title">{al.name}</div>
                <div class="Row" style="column-gap: 8px; justify-content: flex-start;">
                    {#each al.artists as { name }}
                    <Link text={name}/>
                    {/each}
                </div>
            </div>

            <div class="Column align_start extra">
                <div class="Row" style="width: fit-content; gap: 4px;">
                    <span class="icon-round">{'\ue935'}</span>
                    {new Date(al.publishTime).toLocaleDateString()}
                </div>
                <div class="Row" style="width: fit-content; gap: 4px;">
                    <span class="icon-round">{'\ue405'}</span>
                    {al.size}
                </div>
            </div>
        </div>
    </div>
    {/if}
    {/each}
</div>