<script>
    import Popup from './Popup.svelte';
    import Profile from "./Profile.svelte";
    import Avatar from "./Avatar.svelte";
    import ListTile from './ListTile.svelte';
    import { onMount } from 'svelte';

    let showPopup = false;

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
        const {songs} = res;
        suggests = songs.reduce((pre, cur) => {
            return [...pre, cur.name];
        }, []);
    }

    function animIn(ev) {
        ev.detail.animate({
            transform: ['translate(20px, -20px) scale(0.9)', 'translate(0px, 0px) scale(1)'],
            opacity: [0, 1]
        }, 100)
    }

</script>

<style>
    .avatar {
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
        height: 36px;
        outline: none;
        border: none;
        margin: 0px 4px;
        background-color: transparent;
    }

    .menu {
        font-size: 16px;
    }

    .search {
        box-shadow: 0px 0px 2px rgba(0,0,0,0.2);
        width: fit-content;
        background-color: rgba(255,255,255,0.6);
        border-radius: 18px;
        padding: 0px 8px;
        margin: 8px;
    }


</style>

<div class="column">
<div class="column search">
    <span class="iconfont icon-search avatar menu" on:click={search}></span>
    
    <input type="text" class="input" placeholder="搜索歌曲和歌手"
        bind:value
        on:change={search}
        on:focus={getHot}
        on:blur={()=>setTimeout(()=>showHot=false)}
        on:input={getSuggest}>

    <Avatar
        on:click={show}
        size={'normal'}
        isUrl={avatarUrl}
        avatar={avatarUrl || '\ue6bb'}
        width={28}
        height={28}
    ></Avatar>

</div>
    <Popup
        on:layerClick={hide}
        on:animIn={animIn}
        showPopupWindow={showPopup}
        cssText={"position: absolute; top: 88px"}>
        <Profile
            bind:user={user}
        ></Profile>
    </Popup>

    <Popup
        noLayer={true}
        on:layerClick={()=>showHot=false}
        showPopupWindow={showHot}
        cssText={"position: fixed; top: 88px; width: 300px"}>
        {#if suggests}

        {#each suggests as el}
            <ListTile
                size={"small"}
                data={el}
                isUrl={false}
                avatar={''}
                on:mousedown={()=>{value=el; search()}}/>
        {/each}
            <div style="height: 1px; background-color: #ddd"> </div>
        {/if}

        {#each hots as el, i}
            <ListTile
                size={"small"}
                data={el}
                isUrl={false}
                avatar={i+1}
                on:mousedown={()=>{value=el; search()}}/>
        {/each}

    </Popup>
</div>