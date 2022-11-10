<script>
    import { onDestroy, onMount } from "svelte";
    import Measurable from "./components/Measurable.svelte";
    import ScrollView from "./components/ScrollView2.svelte";
    import Playlist from "./Playlist.svelte";

    const s = (str, ...args) => langMapping.s(str, ...args)

    export let playlists = [];

    let container, imgBgc;

    let desktopUrl
    async function getOneDayDesktop() {
        let data = await store.get('dailyDesktop');

        imgBgc.onload = () => {
            __setColor(container, imgBgc, 1);
            container.style.setProperty('--start', 220 + 'px')
        }

        if(data && new Date().getTime() - data.timeStamp < 57600000) {
            return (desktopUrl = data.url);
        }

        data = await server.fetchJson('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1');
        const url = 'https://www.bing.com' + data.images[0].url;
        desktopUrl = url;

        store.set('dailyDesktop', {
            timeStamp: new Date().getTime(), url
        });
    }

    onMount(getOneDayDesktop);

    let pageStore = Pager.getContext().save
    async function getUserPlaylist() {
        if(pageStore.__playlists) return playlists = pageStore.__playlists;

        const cookie = await store.get('cookie'),
        uid = (await store.get('profile')).userId;

        const _playlist = await NeteaseApi.getUserPlaylist(uid, cookie);

        if(_playlist.status != 200) return;
        
        pageStore.__playlists = playlists = _playlist.body.playlist;

    }

    getUserPlaylist();


    async function onClick(name, props) {
        props = await props()
        Pager.openNew(name, Playlist, props);
    }
    

    export function getDetailX(id) {
        let data = store.getSync('playlist'+id);
        if (data) return data;

        return getDetailXAsync(id)
    }

    async function getDetailXAsync(id) {
        let cookie = await store.get('cookie'),
            data = await store.get('playlist'+id)
        
        const list = (await NeteaseApi.getPlaylistDetail(id, cookie)).body.playlist.trackIds;
        
        let ids = list.reduce((pre, cur) => {
            return [...pre, cur.id];
        }, []);

        data = (await NeteaseApi.getSongDetail(ids, cookie)).body.songs;

        store.setCache('playlist'+id, data);
        
        return data;
    }

    let meter, collectionFolded = true;

    function changeHeight() {
        collectionFolded = !collectionFolded;
        meter.measure(({height}) => {
            container.style.setProperty('--height', height + 160 + 'px')
            requestAnimationFrame(() => {
                scrollv.update()
            })
        });
    }

    function clearPlaylist(id) {
        store.rm('playlist'+id);
    }

    function clearAlbum(id) {
        store.rm('al'+id);
    }

    Pager.beforeSwitch(() => {
        const {save} = Pager.getContext()
        if (save) {
            save.collectionFolded = collectionFolded
        }
    })

    onMount(() => {
        contextMap.set(container, {
            '复制图片链接': '',
            '图片另存为': ''
        })

        const {save} = Pager.getContext()
        if (!save || typeof save.collectionFolded === 'undefined') {
            return
        }
        if (!save.collectionFolded) {
            changeHeight()
        }
    })

    onDestroy(() => {
        contextMap.delete(container)
    })

    async function getArtistSublist() {
        let data = pageStore.__artistSublist
        if (!data) {
            let favs = await NeteaseApi.getArtistSublist(await store.get('cookie'), 1)
            favs = await NeteaseApi.getArtistSublist(await store.get('cookie'), favs.body.count)
            favs.body.data.count = favs.body.count
            return pageStore.__artistSublist = favs.body.data
        }

        return data
    }

    let artistSublist = []
    async function renderArtistSublist() {
        let sublist = await getArtistSublist()
        artistSublist = pageStore.showAllArtists
            ? sublist
            : sublist.slice(0, 12)

        artistSublist.count = sublist.count
    }
    renderArtistSublist()

    async function getAlbumSublist() {
        let data = pageStore.__alSublist
        if (!data) {
            let favs = await NeteaseApi.getAlbumSublist(await store.get('cookie'), 1)
            favs = await NeteaseApi.getAlbumSublist(await store.get('cookie'), favs.body.count)
            favs.body.data.count = favs.body.count
            return pageStore.__alSublist = favs.body.data
        }

        return data
    }

    let albumSublist = []
    async function renderAlbumSublist(count) {
        const raw = await getAlbumSublist()
        albumSublist = raw.slice(0, count || raw.count)
        albumSublist.count = raw.count
    }
    if (pageStore.showAllAlbums) {
        renderAlbumSublist()
    } else {
        renderAlbumSublist(12)
    }


    import {MainPlaylist} from '../utils/player/playlist.js'

    async function fastPlay(id, type=0) {
        let list = type === 0
            ? await getDetailX(id)
            : await getAlbumDetail(id)
        
        const cur = MainPlaylist.getCurrentData()

        MainPlaylist.loadList(list)

        if (cur) {
            let res = MainPlaylist.query({name: cur.name})
            if (res.length) {
                return MainPlaylist.play(res[0])
            }
        }
        
        MainPlaylist.play(0)
    }


    function dullParent() {
        this.parentNode.classList.remove('active')
    }

    function activeParent() {
        this.parentNode.classList.add('active')
    }


    function getAlbumDetail(id) {

        let al = store.getSync('al' + id)
        if (!al) {
            return new Promise(async res => {
                al = (await NeteaseApi.getAlbumDetail(id, await store.get('cookie'))).body.songs
                store.set('al'+id, al)
                res(al)
            })
        }

        return al
        
    }

    let scrollv
    Pager.beforeSwitch(() => {
        if (scrollv?.prepared()) {
            const {save} = Pager.getContext()
            save.offsetRatio = scrollv.getOffsetRatio()
        }
    })
    onMount(() => {
        const {save} = Pager.getContext()
        requestIdleCallback(() => scrollv.setOffsetRatio(save.offsetRatio))
    })

    function imageShow(ev) {
        ev.target.style.opacity = 1
    }

</script>


<style>

    .card {
        position: relative;
        width: 160px;
        height: 200px;
        border-radius: 8px;
        margin: 0px 36px 16px 0px;
        justify-content: flex-start;
        transition: all 0.1s;
        z-index: 0;
    }

    .card > .row {
        justify-content: flex-start;
        width: 160px;
    }

    .card.active:active {
        transform: scale(0.96);
    }

    .collection[data-title] {
        --start: 370px;
        --height: 370px;
        --color: #eee;
        display: flex;
        position: relative;
        color: #fff;
        border-radius: 12px;
        font-weight: bold;
        width: calc(100% - 48px);
        margin: 24px;
        box-sizing: border-box;
        flex-wrap: wrap;
        align-items: flex-start;
        padding: 24px;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) var(--start), var(--color) calc(var(--start) + 100px));
        overflow: hidden;
        box-shadow: 0px 4px 12px var(--color);
        height: 375px;
        overflow: hidden;
    }

    .collection.unfold {
        height: var(--height);
    }

    .collection[data-title]::before {
        font-size: xx-large;
        content: attr(data-title);
        width: calc(100% - 48px);
        height: 136px;
        text-shadow: 0px 1px 6px rgba(0,0,0,1);
    }

    .collection-bgc {
        position: absolute;
        z-index: -1;
        width: 100%;
        height: 470px;
        top: 0;
        left: 0;
        object-fit: cover;
    }

    .toggle {
        position: absolute;
        top: 32px;
        right: 32px;
        text-shadow: 0px -1px 4px rgba(0,0,0,0.4), 0px 1px 4px rgba(0,0,0,0.4), 1px 0px 4px rgba(0,0,0,0.4), -1px 0px 4px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: all 0.3s;
    }

    .title {
        padding-top: 8px;
        align-items: flex-start;
        font-size: small;
    }

    .card-container {
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .toggle.unfold {
        transform: rotate(180deg);
    }

    .avatar {
        position: relative;
        border-radius: 4px;
        width: 160px;
        height: 160px;
        background-size: 160px 160px;
        transition: 0.1s;
    }

    .avatar:hover {
        box-shadow: 0px 6px 8px rgba(0,0,0,0.2);
    }

    .card:hover {
        transform: translateY(-2px);
    }

    .artist {
        box-sizing: border-box;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        padding: 1px;
        border: solid 1px var(--controlGray);
        background-color: var(--controlGray);
    }

    .artist-c {
        justify-content: center;
        width: 160px;
        margin-right: 4px;
        margin-bottom: 8px;
        height: 200px;
        border-radius: 8px;
        transition: transform 0.12s;
    }

    .artist-c > .name {
        color: var(--controlNight);
        height: 18px;
        line-height: 18px;
        font-size: small;
    }

    .name.title {
        color: var(--controlBlack);
        font-weight: bold;
        font-size: small;
    }

    .artist-c:hover {
        background-color: var(--controlAcrylicDark);
    }

    .artist-c.active:active {
        transform: scale(0.96);
    }

    .card > .btn {
        position: absolute;
        visibility: hidden;
        bottom: 48px;
        right: 8px;
    }

    .card:hover > .btn{
        visibility: visible;
    }

    .album {
        box-sizing: border-box;
        width: 140px;
        height: 140px;
        border-radius: 8px;
        padding: 1px;
        border: solid 1px var(--controlGray);
        background-color: var(--controlGray);
    }

    .artist-c.al {
        height: 220px;
        justify-content: flex-start;
        padding-top: 12px;
    }

    .artist-c > .FAB {
        position: absolute;
        right: 16px;
        top: 108px;
        visibility: hidden;
    }

    .artist-c:hover > .FAB {
        visibility: visible;
    }

    img {
        background-color: var(--controlGray);
    }


</style>


<ScrollView bind:this={scrollv}>
<div class="row">

<div class="collection{!collectionFolded?' unfold':''}" data-title="{s('my_playist')}" bind:this={container}>
    <img class="collection-bgc" src={desktopUrl} alt="" bind:this={imgBgc}>
    <div title="{s('unfold')}" class="toggle{!collectionFolded?' unfold':''}" on:click={changeHeight}>▼</div>
    
    <Measurable bind:this={meter} cssStyle="width: 100%">
    <div class="column card-container">
    {#each playlists as list, i}
        <div class="card row active" title={list.name} on:click={() => {
            let id = list.id;

            onClick(list.name, async () => {
                return {
                    header: {
                        imgUrl: list.coverImgUrl,
                        title: list.name,
                        subtitle: s('created_by', list.creator.nickname),
                        playCount: list.playCount,
                        trackCount: list.trackCount,
                    },
                    listData: getDetailX(id),
                    sortBy: await window.store.get('playlist/sortBy'),
                    forwards: await window.store.get('playlist/forwards'),
                    onTabDestroy() {
                        clearPlaylist(id)
                    },
                }
            });
            
        }}>
            <div class="avatar" style="background-image: url({list.coverImgUrl});"></div>
            <div class="btn light FAB"
                on:click|stopPropagation={() => {fastPlay(list.id)}}
                on:mouseenter|stopPropagation={dullParent}
                on:mouseleave|stopPropagation={activeParent}
            >{'\ue615'}</div>
            <div class="row title">
                <div>{list.name}</div>
            </div>
        </div>
    {/each}
    </div>
    </Measurable>
    
</div>

{#if artistSublist.length}
<div class="Row" row-title="{s('favorite_artists')}" style="--item-height: 200px; --item-width: 200px; align-self: flex-start;">
    <div class="btn light dynamic"
        style="position: absolute; left: 200px; top: 0px; border-radius: 6px;"
        on:click={() => {
            if (!pageStore.showAllArtists) {
                pageStore.showAllArtists = true
                renderArtistSublist()
            } else {
                pageStore.showAllArtists = false
                renderArtistSublist()
            }
        }}
    >{s(
        'all_artists',
        pageStore.showAllArtists? s('collapse'): s('expand'),
        artistSublist.count
    )}</div>
    {#each artistSublist as artist, i}
        <div class="Column artist-c active">
            <div class="btn light FAB"
                on:click|stopPropagation={() => {}}
                on:mouseenter|stopPropagation={dullParent}
                on:mouseleave|stopPropagation={activeParent}
            >{'\ue615'}</div>
            <img
                class="artist"
                draggable="false"
                src={artist.picUrl}
                on:load={imageShow}
                alt={artist.name}
                decoding="async">
            <div class="name title">{artist.name}</div>
            <div class="name">{artist.alias.length? artist.alias[0]: ''}</div>
        </div>
    {/each}
</div>
{/if}

{#if albumSublist.length}
<div class="Row" row-title="{s('favorite_albums')}" style="--item-height: 200px; --item-width: 200px; align-self: flex-start;">
    <div class="btn light dynamic"
        style="position: absolute; left: 200px; top: 0px; border-radius: 6px;"
        on:click={() => {
            if (!pageStore.showAllAlbums) {
                renderAlbumSublist()
                pageStore.showAllAlbums = true
            } else {
                renderAlbumSublist(12)
                pageStore.showAllAlbums = false
            }
        }}
    >{s(
        'all_albums',
        pageStore.showAllAlbums? s('collapse'): s('expand'),
        albumSublist.count
    )}</div>
    {#each albumSublist as al, i}
        <div class="Column artist-c al active"
            on:click={() => {
                let id = al.id;
                
                onClick(al.name, async() => {
                    return {
                        header: {
                            imgUrl: al.picUrl,
                            title: al.name,
                            subtitle: `${al.artists.reduce((pre, cur) => [...pre, cur.name], []).join(' ')}`,
                            playCount: al.playCount,
                            trackCount: al.size,
                        },
                        listData: getAlbumDetail(id),
                        sortBy: await window.store.get('playlist/sortBy'),
                        forwards: await window.store.get('playlist/forwards'),
                        onTabDestroy() {
                            clearAlbum(id)
                        },
                    }
                })
            }}
        >
            <div class="btn light FAB"
                on:click|stopPropagation={() => {fastPlay(al.id, 1)}}
                on:mouseenter|stopPropagation={dullParent}
                on:mouseleave|stopPropagation={activeParent}
            >{'\ue615'}</div>
            <img class="album" style="opacity: 0; transition: opacity 1s" draggable="false" src={al.picUrl} alt={al.name} on:load={imageShow} decoding="async">
            <div class="name title" style="width: calc(100% - 16px);">{al.name}</div>
        </div>
    {/each}
</div>
{/if}

</div>
</ScrollView>