<script>
    import ListTile from "./ListTile.svelte";
    import Popup from './Popup.svelte';
    import Login from '../Login.svelte';
    import Editprofile from "../Editprofile.svelte";
    import {getContext} from 'svelte';
    import RippleLayer from "./RippleLayer.svelte";
    import Settings from "../Settings.svelte";
    import {defaultWizard} from '../../utils/wizard/edit-profile/index.js'


    let close = getContext('close');

    export let user;

    let isLogedin = !!user.avatarUrl;

    let pop = false;
    let hide = () => {
        pop = false;
        const profile = store.get('profile');
        if (profile) {
            user = {
                avatarUrl: profile.avatarUrl,
                name: profile.nickname,
            }
            isLogedin = !!user.avatarUrl;
        }
    }
    let show = () => {
        pop = true;
    }


    function logOut() {
        NeteaseApi.logout()
        store.rm('profile');
        store.rm('token');
        user = {
            avatarUrl: '',
            name: '未登录',
        }
        isLogedin = !!user.avatarUrl;
    }


    let showEditProfile = () => {
        close();
        // Pager.openNew('个人信息', Editprofile, {});
        defaultWizard.display(true)
    }

    function showSettings() {
        close();
        Pager.openNew('设置', Settings, {});
    }


</script>


<style>
    .row {
        width: 100%;
        align-items: flex-start;
    }

    .c {
        width: 300px;
        padding: 12px 0px;
        background-color: var(--controlWhite);
    }

    header, .article {
        border-bottom: solid 1px #ddd;
    }

    footer {
        width: 100%;
        margin: 12px 0px 4px 0px;
        font-size: x-small;
        color: #bbb;
    }
</style>


<div class="row c">
    <header class="row">
        <Popup
            bind:showPopupWindow={pop}
            on:layerClick={hide}
            >
            <Login/>
        </Popup>

        <ListTile
            isUrl={user.avatarUrl}
            avatar={user.avatarUrl || '\ue6bb'}
            data={user.name}
            width={28}
            height={28}
            clickable={false}/>

        {#if isLogedin}
        <div style="padding-left: 56px; margin: 8px 0px;">
            <div class="btn outlined" on:click={showEditProfile}> {"\ue66b  修改个人信息"} </div>
        </div>
        {/if}

        

        {#if isLogedin}
        <ListTile
            style={"font-size: small"}
            isUrl={false}
            size={'small'}
            avatar={'\ue68f'}
            data={'注销'}
            on:click={logOut}/>
        {:else}
        <ListTile
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue610'}
            data={'登陆'}
            on:click={show}/>
        {/if}

    </header>

    <div class="article row">
        <ListTile
            on:click={showSettings}
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue6aa'}
            data={'设置'}/>
        <ListTile
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue666'}
            data={'下载管理'}/>
    </div>

    <footer class="column">
        REM
    </footer>


</div>