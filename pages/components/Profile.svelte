<script>
    import ListTile from "./ListTile.svelte"
    import Login from '../Login.svelte'
    import { getContext } from 'svelte'
    import { defaultWizard } from '../../utils/wizard/edit-profile/index.js'
    import { store } from '../../utils/stores/base.js'
    import { rem } from "../../utils/rem"
    import { homeOptions } from '../../utils/home/browser'

    function login() {
        Pager.openNew('登录', Login)
        close()
    }

    let close = getContext('close')
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

    let options = homeOptions

    rem.on('refreshHomeOptions', () => {
        options = options
    })

    function avatarFromExt(path, folder) {
        if (path.startsWith('./')) {
            return `${AppPaths.Extensions}/${folder}/${path.slice(2)}`
        }

        return `${AppPaths.Extensions}/${folder}/${path}`
    }
</script>


<style>
    .Column {
        width: 100%;
        align-items: flex-start;
        flex-wrap: nowrap;
    }

    .c {
        border-radius: 16px;
        width: 300px;
        max-height: calc(100vh - 96px);
        padding: 12px 0px;
        background-color: var(--controlWhite);
        overflow: auto;
    }

    header.Column {
        contain: paint;
        width: calc(100% - 20px);
        margin: 4px 10px 0;
        background-color: var(--controlBackground2);
        border-radius: 12px;
    }
</style>


<div class="Column c scrollable">
    <header class="Column">
        <ListTile
            isUrl={user.avatarUrl}
            avatar={user.avatarUrl || '\ue7fd'}
            data={s(user.name)}
            width={28}
            height={28}
            clickable={false}/>

        {#if isLogedin}
        <div style="padding-left: 56px; margin: 8px 0px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="btn outlined" on:click={showEditProfile}> {"\ue66b  " + s('edit_profile')} </div>
        </div>
        {/if}

        

        {#if isLogedin}
        <ListTile
            style={"font-size: small"}
            isUrl={false}
            size={'small'}
            avatar={'\ue16f'}
            data={s('logout')}
            on:click={logOut}/>
        {:else}
        <ListTile
            isUrl={false}
            style={"font-size: small"}
            size={'small'}
            avatar={'\ue157'}
            data={s('login')}
            on:click={login}/>
        {/if}

    </header>

    <div class="article Column">
        {#each options as { title, avatar, onClick, isUrl, extFolder }}
            <ListTile
                on:click={() => {
                    onClick()
                    close()
                }}
                isUrl={!!isUrl}
                padding={18}
                style={"font-size: small"}
                size={'small'}
                width={24}
                avatar={extFolder ? avatarFromExt(avatar, extFolder) : avatar}
                data={s(title)}/>
        {/each}
    </div>
</div>