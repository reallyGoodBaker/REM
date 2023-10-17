<script>
    import ListTile from "./ListTile.svelte"
    import Login from '../Login.svelte'
    import { getContext } from 'svelte'
    import Settings from "../Settings.svelte"
    import {defaultWizard} from '../../utils/wizard/edit-profile/index.js'
    import {store} from '../../utils/stores/base.js'
    import ExtensionList from '../../extension/ExtensionList.svelte'

    function login() {
        Pager.openNew('登录', Login)
    }

    let close = getContext('close');
    const s = (f, ...args) => {
        return langMapping.s(f, ...args) || f
    }

    export let user

    let isLogedin = !!user.avatarUrl

    function logOut() {
        NeteaseApi.logout()
        store.rm('profile')
        store.rm('token')
        user = {
            avatarUrl: '',
            name: 'not_login',
        }
        isLogedin = !!user.avatarUrl
    }


    let showEditProfile = () => {
        close();
        // Pager.openNew('个人信息', Editprofile, {});
        defaultWizard.display(true)
    }

    function showSettings() {
        close();
        Pager.openNew('$settings', Settings, {})
    }

    function showExtensionsPage() {
        close()
        Pager.openNew('$extensions', ExtensionList, {})
    }

    const options = [
        {
            isUrl: false,
            avatar: '\ue6aa',
            title: s('settings'),
            onClick: showSettings,
        },
        {
            avatar: '\ue666',
            title: s('download_manager'),
            onClick: Function.prototype,
        },
        {
            avatar: '\ue68b',
            title: s('extensions'),
            onClick: showExtensionsPage,
        },
    ]
</script>


<style>
    .row {
        width: 100%;
        align-items: flex-start;
    }

    .c {
        contain: paint;
        border-radius: 16px;
        width: 300px;
        padding: 12px 0px;
        background-color: var(--controlWhite);
    }

    header.row {
        contain: paint;
        width: calc(100% - 20px);
        margin: 4px 10px 0;
        background-color: var(--controlBackground2);
        border-radius: 12px;
    }
</style>


<div class="row c">
    <header class="row">
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
            on:click={login}/>
        {/if}

    </header>

    <div class="article row">
        {#each options as { title, avatar, onClick, isUrl }}
            <ListTile
                on:click={onClick}
                isUrl={!!isUrl}
                padding={16}
                style={"font-size: small"}
                size={'small'}
                avatar={avatar}
                data={title}/>
        {/each}
    </div>
</div>