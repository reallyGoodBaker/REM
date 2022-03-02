<script>
    import { onMount } from "svelte";
    import Measurable from "./components/Measurable.svelte";
    import ScrollView from "./components/ScrollView.svelte";
    import Playlist from "./Playlist.svelte";


    export let playlists = [];

    let container, imgBgc;

    let desktopUrl;
    let outerContainer;
    async function getOneDayDesktop() {
        let data = store.get('onDayDesktop');

        imgBgc.onload = () => {
            let offset = 37;
            __setColor(container, imgBgc, 1);
            let i = setInterval(() => {
                if(offset < 22) {
                    clearInterval(i);
                    return;
                }
                container.style.setProperty('--start', (--offset) * 10+'px');
            }, 16.6);
            outerContainer.recalc();
        }

        if(data && new Date().getTime() - data.timeStamp < 57600000) {
            return (desktopUrl = data.url);
        }

        data = await ((await fetch('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')).json());
        const url = 'https://www.bing.com' + data.images[0].url;
        desktopUrl = url;

        store.set('onDayDesktop', {
            timeStamp: new Date().getTime(), url
        });
    }

    onMount(getOneDayDesktop);

    async function getUserPlaylist() {
        if(window.__playlists) return playlists = window.__playlists;

        const cookie = store.get('cookie'),
        uid = store.get('profile').userId;

        const _playlist = await NeteaseApi.getUserPlaylist(uid, cookie);

        if(_playlist.status != 200) return;
        
        window.__playlists = playlists = _playlist.body.playlist;

    }

    getUserPlaylist();

    let listData;

    function onClick(i, props) {
        Pager.openNew(playlists[i].name, Playlist, props);
    }
    

    /**
     * @deprecated
     */
    async function getDetail(id) {
        const _data = (await NeteaseApi.getPlaylistDetail(id, store.get('cookie'))).body;
        const data = _data.playlist.tracks;
        listData = data;
    }

    async function getDetailX(id) {
        let data = store.get(id);
        if (data) return data;

        let cookie = store.get('cookie');
        const list = (await NeteaseApi.getPlaylistDetail(id, cookie)).body.playlist.trackIds;
        
        let ids = list.reduce((pre, cur) => {
            return [...pre, cur.id];
        }, []);

        data = (await NeteaseApi.getSongDetail(ids, cookie)).body.songs;

        store.setCache(id, data);
        
        return data;
    }

    let meter, collectionFolded = true;

    function changeHeight() {
        collectionFolded = !collectionFolded;
        meter.measure(({height}) => {
            container.style.setProperty('--height', height + 160 + 'px');
            setTimeout(() => {
                outerContainer.recalc();
            }, 300);
        });
    }

    function clearCache(id) {
        store.rm(id);
    }

</script>


<style>

    .card {
        position: static;
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

    .card:active {
        transform: scale(0.94);
    }

    .collection[title] {
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
        transition: all 0.2s;
    }

    .collection.unfold {
        height: var(--height);
    }

    .collection[title]::before {
        font-size: xx-large;
        font-weight: bold;
        content: attr(title);
        width: calc(100% - 48px);
        height: 136px;
        text-shadow: 0px 1px 6px rgba(0,0,0,1);
    }

    .collection-bgc {
        position: absolute;
        z-index: -1;
        top: calc(50% - 100px);
        left: calc(50% - 24px);
        transform: translate(-50%, -50%);
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
    }

    .avatar::after {
        content: '';
        position: absolute;
        width: 160px;
        height: 160px;
        background: inherit;
        bottom: -4px;
        left: 0px;
        filter: blur(4px) opacity(0.6);
        border-radius: 4px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.1s ease-out;
    }

    .avatar:hover::after {
        opacity: 1;
    }

</style>


<ScrollView bind:this={outerContainer}>
<div class="row">

<div class="collection{!collectionFolded?' unfold':''}" title="我的收藏" bind:this={container}>
    <img class="collection-bgc" src={desktopUrl} alt="" bind:this={imgBgc}>
    <div class="toggle{!collectionFolded?' unfold':''}" on:click={changeHeight}>▼</div>
    
    <Measurable bind:this={meter} cssStyle="width: 100%">
    <div class="column card-container">
    {#each playlists as list, i}
        <div class="card row" on:click={() => {
            let id = list.id;

            onClick(i, () => {
                return {
                    header: {
                        imgUrl: list.coverImgUrl,
                        title: list.name,
                        subtitle: `由${list.creator.nickname}创建`,
                        playCount: list.playCount,
                        trackCount: list.trackCount,
                    },
                    listData: getDetailX(id),
                    sortBy: window.store.get('sortBy'),
                    forwards: window.store.get('forwards'),
                    onTabDestroy() {
                        clearCache(id)
                    },
                }
            });
            
        }}>
            <div class="avatar" style="background-image: url({list.coverImgUrl});"></div>
            <div class="row title">
                <div>{list.name}</div>
                <!-- <div>{list.trackCount}</div>
                <div>{list.playCount}</div> -->
            </div>
        </div>
    {/each}
    </div>
    </Measurable>
    
</div>


</div>
</ScrollView>