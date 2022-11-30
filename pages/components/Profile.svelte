<script>
    import ListTile from "./ListTile.svelte";
    import Popup from './Popup.svelte';
    import Login from '../Login.svelte';
    import {getContext, onMount} from 'svelte';
    import Settings from "../Settings.svelte";
    import {defaultWizard} from '../../utils/wizard/edit-profile/index.js'
    import {store} from '../../utils/stores/base.js'
    import ExtensionList from '../../extension/ExtensionList.svelte'

    let close = getContext('close');
    const s = (f, ...args) => {
        return langMapping.s(f, ...args) || f
    }

    export let user;

    let isLogedin = !!user.avatarUrl;

    let pop = false, login

    let hide = async () => {
        pop = false;
        const profile = await store.get('profile');
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
        console.log(login);
    }


    function logOut() {
        NeteaseApi.logout()
        store.rm('profile');
        store.rm('token');
        user = {
            avatarUrl: '',
            name: 'not_login',
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
        Pager.openNew('$settings', Settings, {});
    }

    let showExtensions = false
    onMount(async () => {
        showExtensions = (await store.get('AppSettings/beta_features')).extensions
    })

    function showExtensionsPage() {
        close()
        Pager.openNew('$extensions', ExtensionList, {})
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
            <div bind:this={login}>?????</div>
            <Login/>
        </Popup>

        <ListTile
            isUrl={user.avatarUrl}
            avatar={user.avatarUrl || '\ue6bb'}
            data={s(user.name)}
            width={28}
            height={28}
            clickable={false}/>

        {#if isLogedin}
        <div style="padding-left: 56px; margin: 8px 0px;">
            <div class="btn outlined" on:click={showEditProfile}> {"\ue66b  " + s('edit_profile')} </div>
        </div>
        {/if}

        

        {#if isLogedin}
        <ListTile
            style={"font-size: small"}
            isUrl={false}
            size={'small'}
            avatar={'\ue68f'}
            data={s('logout')}
            on:click={logOut}/>
        {:else}
        <ListTile
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue610'}
            data={s('login')}
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
            data={s('settings')}/>
        <ListTile
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue666'}
            data={s('download_manager')}/>
        {#if showExtensions}
        <ListTile
            on:click={showExtensionsPage}
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue68b'}
            data={s('extensions')}/>
        {/if}
    </div>

    <footer class="column">
        REM
    </footer>


</div>