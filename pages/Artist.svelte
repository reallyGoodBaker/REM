<script>
    import LoadingCircle from "./components/LoadingCircle.svelte"
    import Avatar from "./components/Avatar.svelte"
    import Image from "./components/Image3.svelte"
    import { store } from "../utils/stores/base"
    import { MainPlaylist } from "../utils/player/playlist"
    import { AudioPlayer } from '../utils/player/player'
    import { NETEASE_IMG_MEDIUM } from "../utils/stores/img"
    import { onMount } from "svelte"
    import RecyclerScrollView from "./components/RecyclerScrollView.svelte"
    import ArtistCard from "./components/ArtistCard.svelte";

    export let id = 0

    const ctx = Pager.getContext()
    const save = ctx.save

    async function getArtist() {
        const artist = save.artist
            ?? (save.artist = await NeteaseApi.getArtistDetail(id))

        const songs = save.songs
            ?? (save.songs = await NeteaseApi.getArtistSongs(id, 56))

        for (const song of songs.songs) {
            song.al.picUrl = await getAlbumIcon(song.al)
        }
        
        return { artist, songs }
    }

    async function getAlbumIcon(album) {
        let picUrl = await store.get(`AlbumPic/${album.pic}`)
        
        if (!picUrl) {
            const result = await NeteaseApi.getAlbumDetail(album.id, await store.get('cookie'))
            
            if (!result) {
                return null
            }

            picUrl = result.body.album.picUrl
            store.set(`AlbumPic/${album.pic}`, picUrl)
        }

        return picUrl
    }

    function playSelect(songs, i) {
        const cur = MainPlaylist.getCurrentData()

        if (cur && cur.id === songs[i].id) {
            AudioPlayer.isPlaying()
                ? AudioPlayer.pause()
                : AudioPlayer.play()
            return
        }

        MainPlaylist.loadList(songs)
        MainPlaylist.play(i)
    }

    let selected = 0
    let navs = [
        {
            name: '歌曲',
            icon: '\ue405'
        },
        {
            name: '专辑',
            icon: '\ue019'
        },
        // {
        //     name: '搜索',
        //     icon: '\ue8b6'
        // },
    ]
    async function getArtistAlbums() {
        const detail = save.albums
            ?? (save.albums = await NeteaseApi.getArtistAlbums(id))
        return detail
    }

    Pager.beforeSwitch(() => {
        save.selected = selected
    })

    onMount(async () => {
        if (typeof save.selected === 'number') {
            selected = save.selected
        }

        Pager.setSearchPlaceholder(`搜索${(await getArtist()).artist.artist.name}的作品`)
    })
</script>

{#await getArtist()}
<LoadingCircle></LoadingCircle>
{:then { artist: { artist }, songs: { songs } }} 
<div class="Column c scrollable">
    <div class="Row" style="width: 100%; height: 100%; align-items: flex-start;">
        <div class="Column artist">
            <Avatar
                avatar={artist.avatar}
                width={200}
                height={200}
                clickable={true}
                radius={'8px'}
            />
            <div class="txt title">{artist.name}{artist.transNames[0] ? ` (${artist.transNames[0]})` : ''}</div>
            <div class="txt desc scrollable flex">{artist.briefDesc}</div>
        </div>

        <div class="panel">
            <div class="switcher">
                {#each navs as { name, icon }, i}
                <div class="tile {selected === i ? 'selected' : ''}" on:click={() => selected = i}>
                    <span class="icon-round">{icon}</span>{name}
                </div>
                {/each}
            </div>
            <div class="pop_container">
                <div class="Row pop scrollable">
                {#if selected === 0}
                    {#each songs as song, i}
                        <div class="Column song" on:click={() => {
                            playSelect(songs, i)
                        }}>
                            <Image width={96} height={96} src={
                                song.al.picUrl
                                    ? song.al.picUrl + NETEASE_IMG_MEDIUM
                                    : ''
                            } borderWidth='0'/>
                            <div class="song-title">{song.name}</div>
                        </div>
                    {/each}
                
                {:else if selected === 1}
                    {#await getArtistAlbums()}
                    <LoadingCircle></LoadingCircle>
                    {:then { hotAlbums }}
                    <RecyclerScrollView
                        templateHeight={160}
                        count={Math.ceil(hotAlbums.length / 2)}
                        getItem={i => [hotAlbums[2 * i], hotAlbums[2 * i + 1]]}
                        template={ArtistCard}
                        getProps={item => {
                            return {
                                als: item
                            }
                        }}
                    />
                    {/await}
                {/if}
                </div>
            </div>
        </div>
    </div>

    <div>
        
    </div>
</div>
{/await}


<style>
    .c {
        flex-wrap: nowrap;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 24px;
        overflow-y: auto;
    }

    .artist {
        box-sizing: border-box;
        height: 100%;
        width: 200px;
    }

    .title {
        margin: 12px 0;
        font-weight: bold;
        font-size: larger;
        align-self: self-start;
    }

    .desc {
        line-break: loose;
        width: 100%;
        height: 200px;
        flex-grow: 1;
        overflow-y: auto;
        overflow-x: hidden;
        opacity: 0.5;
    }

    .panel {
        box-sizing: border-box;
        width: calc(100% - 220px);
        margin-left: 20px;
        height: 100%;
        border-radius: 12px;
    }

    .switcher {
        display: flex;
        width: fit-content;
        height: 32px;
        border-radius: 12px 12px 0 0;
        background-color: var(--controlBright84);
        padding: 0 4px;
        overflow: hidden;
    }

    .tile {
        border-radius: 10px 10px 0 0;
        height: calc(100% - 4px);
        margin-top: 4px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: small;
        min-width: 64px;
        width: fit-content;
        padding: 0 12px;
        gap: 4px;
    }
    .tile:hover {
        background-color: var(--fadeBright);
    }
    .tile:active {
        background-color: var(--fade);
    }
    .tile.selected, .tile.selected:hover, .tile.selected:active {
        background-color: var(--controlBrighter);
        box-shadow: 0 0 6px var(--fade);
    }
    .icon-round {
        font-size: small;
    }

    .pop_container {
        padding: 16px;
        background-color: var(--controlBrighter);
        box-sizing: border-box;
        height: calc(100% - 32px);
        border-radius: 0 8px 8px 8px;
    }

    .pop {
        box-sizing: border-box;
        height: 100%;
        flex-wrap: wrap;
        overflow-y: auto;
        gap: 2px;
    }

    .song {
        padding: 2px;
        width: 100px;
        height: fit-content;
        border-radius: 8px;
        transition: transform 0.1s;
    }
    .song:hover {
        background-color: var(--fade);
    }
    .song:active {
        transform: scale(0.96);
    }

    .song-title {
        margin: 4px;
        font-size: small;
        line-height: 1.2em;
        width: calc(100% - 8px);
        height: 3.6em;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>