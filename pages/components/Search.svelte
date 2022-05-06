<script>
    import Popup from './Popup.svelte';
    import Profile from "./Profile.svelte";
    import Avatar from "./Avatar.svelte";
    import ListTile from './ListTile.svelte';
    import ScrollView from './ScrollView.svelte';
    import { onMount } from 'svelte';

    let showPopup = false

    const show = () => showPopup = true;
    const hide = () => {
        showPopup = false;
        const profile = store.get('profile');
        if (profile) {
            user = {
                avatarUrl: profile.avatarUrl,
                name: profile.nickname,
            }
        }
        avatarUrl = profile? profile.avatarUrl: '';
    }

    let profile = store.get('profile');
    let user = {
        avatarUrl: '',
        name: '未登录',
    };
    export let avatarUrl = profile? profile.avatarUrl: '';

    function showAvatar() {
        if (profile) {
            user = {
                avatarUrl: profile.avatarUrl,
                name: profile.nickname,
            }
        }
        avatarUrl = profile? profile.avatarUrl: '';
    }
    showAvatar();
    __emitter.on('__updateLoginAvatar', () => {
        profile = store.get('profile');
        showAvatar();
    });

    let value, showHot = false, hots = [];
    async function search() {
        const res = await NeteaseApi.search(value);
        //console.log(res);
    }

    async function getHot() {
        hots = (await NeteaseApi.search()).body.result.hots.reduce((pre, cur) => {
            return [...pre, cur.first];
        }, []);
        showHot = true;
    }

    let suggests;
    async function getSuggest() {
        if(!value) return suggests = null;
        const res = (await NeteaseApi.suggest(value)).body.result;
        console.log(res);
        if (Object.keys(res).length) {
            suggests = res
        }
    }

    function animIn(ev) {
        ev.detail.animate({
            transform: ['translate(-20px, -32px) scale(0.9)', 'translate(0px, 0px) scale(1)'],
            opacity: [0, 1]
        }, 100)
    }


</script>

<style>
    .avatar {
        position: relative;
        width: 28px;
        height: 28px;
        font-size: 28px;
        text-align: center;
        line-height: 28px;
        border-radius: 50%;
        cursor: pointer;
    }

    .input {
        width: 200px;
        height: 30px;
        outline: none;
        border: none;
        margin: 0px 4px;
        background-color: transparent;
    }

    .menu {
        font-size: 16px;
    }

    .search {
        flex-direction: row-reverse;
        -webkit-app-region: no-drag;
        box-shadow: 0px 0px 2px rgba(0,0,0,0.2);
        width: fit-content;
        background-color: rgba(255,255,255,0.4);
        border-radius: 8px;
        padding: 0px 8px;
        margin: 8px;
    }

    .avatar-container {
        -webkit-app-region: no-drag;
        position: absolute;
        left: -48px;
    }

    .column {
        overflow: visible;
        position: relative;
    }

    .title {
        font-size: small;
        padding: 12px 0px 4px 12px;

    }

</style>

<div class="column" style="margin-left: 64px;">
<div class="column search">
    <span class="iconfont icon-search avatar menu" on:click={search}></span>
    
    <input type="text" class="input" placeholder="搜索歌曲和歌手"
        bind:value
        on:change={search}
        on:focus={getHot}
        on:blur={()=>setTimeout(()=>showHot=false)}
        on:input={getSuggest}>

    <div class="avatar-container">
        <Avatar
            on:click={show}
            size={'big'}
            isUrl={avatarUrl}
            avatar={avatarUrl || '\ue6bb'}
            width={32}
            height={32}
        />
    </div>

</div>
    <Popup
        on:layerClick={hide}
        on:animIn={animIn}
        showPopupWindow={showPopup}
        cssText={"position: absolute; top: 54px;"}>
        <Profile
            bind:user={user}
        ></Profile>
    </Popup>

    <Popup
        noLayer={true}
        on:layerClick={()=>showHot=false}
        showPopupWindow={showHot}
        cssText={"position: fixed; top: 54px; width: 360px; overflow: hidden; max-height: calc(100vh - 148px);"}>
        {#if suggests}

        {#if suggests.songs}
            <div class="title">歌曲</div>
            {#each suggests.songs as el}
                <ListTile
                    size={"small"}
                    data={el.name}
                    isUrl={false}
                    avatar={''}
                    on:mousedown={()=>{value=`${el.name}`; search()}}/>
            {/each}
            <div style="height: 1px; background-color: #ddd"> </div>
        {/if}

        {#if suggests.artists}
            <div class="title">艺术家</div>
            {#each suggests.artists as el}
                <ListTile
                    size={"small"}
                    data={el.name}
                    isUrl={true}
                    avatar={el.img1v1Url}
                    width={24}
                    height={24}
                    on:mousedown={()=>{value=`${el.name}`; search()}}/>
            {/each}
            <div style="height: 1px; background-color: #ddd"> </div>
        {/if}

        {#if suggests.albums}
            <div class="title">专辑</div>
            {#each suggests.albums as el}
                <ListTile
                    size={"small"}
                    data={el.name}
                    isUrl={false}
                    avatar={' '}
                    on:mousedown={()=>{value=`${el.name}`; search()}}/>
            {/each}
            <div style="height: 1px; background-color: #ddd"> </div>
        {/if}

        {#if suggests.playlists}
            <div class="title">歌单</div>
            {#each suggests.playlists as el}
                <ListTile
                    size={"small"}
                    data={el.name}
                    isUrl={true}
                    avatar={el.coverImgUrl}
                    width={24}
                    height={24}
                    on:mousedown={()=>{value=`${el.name}`; search()}}/>
            {/each}
        {/if}
        
        {:else}

        {#each hots as el, i}
            <ListTile
                size={"small"}
                data={el}
                isUrl={false}
                avatar={i+1}
                on:mousedown={()=>{value=el; search()}}/>
        {/each}

        {/if}
    </Popup>
</div>