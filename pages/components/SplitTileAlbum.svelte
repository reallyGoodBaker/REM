<script>
    import { store } from "../../utils/stores/base"
    import Playlist from "../Playlist.svelte"
    import Link from "./Link.svelte"

    const s = (str, ...args) => langMapping.s(str, ...args)

    export let data = {}
</script>

<Link cssText="line-height: 1.2em;" text={data.name} on:click={async () => {
    const { album, songs } = (await window.NeteaseApi.getAlbumDetail(data.id, await store.get('cookie'))).body
    window.Pager.openNew(data.name, Playlist, {
        header: {
            imgUrl: album.picUrl,
            title: album.name,
            artists: album.artists,
            trackCount: album.size,
            desc: album.description,
        },
        listData: songs
    })
}}/>