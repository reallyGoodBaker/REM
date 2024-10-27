<script>
    import Popup from './Popup.svelte'
    import Profile from "./Profile.svelte"
    import Avatar from "./Avatar.svelte"
    import {store} from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'
    import { onMount } from 'svelte';

    let showPopup = false
    let searchInput
    let l = langMapping.getMapping()

    export let placeholder = l['search']

    const updateLang = lang => {
        l = lang.getMapping()
    }

    rem.on('langChange', updateLang)

    Pager.beforeSwitch(() => rem.off('langChange', updateLang))

    const show = () => {
        showPopup = true
        showSearch = false
    }
    const hide = async () => {
        showPopup = false;
        const profile = await store.get('profile')
        if (profile) {
            user = {
                avatarUrl: profile.avatarUrl,
                name: profile.nickname,
            }
        }
        avatarUrl = profile? profile.avatarUrl: ''
    }

    let profile = store.getSync('profile')
    let user = {
        avatarUrl: '',
        name: 'not_login',
    }
    export let avatarUrl = profile? profile.avatarUrl: ''

    async function showAvatar() {
        if (profile) {
            user = {
                avatarUrl: profile.avatarUrl,
                name: profile.nickname,
            }
        }
        avatarUrl = profile? profile.avatarUrl: ''
    }
    showAvatar()
    rem.on('__updateLoginAvatar', async () => {
        profile = await store.get('profile')
        showAvatar()
    });

    let value, showSearch = false, suggests = []

    function animIn(ev) {
        ev.detail.animate({
            transform: ['translate(-20px, -32px) scale(0.9)', 'translate(0px, 0px) scale(1)'],
            opacity: [0, 1]
        }, 100)
    }

    $: performSearch = () => suggests = window.Pager?.performSearch(value) || []
    $: performSearchInput = () => suggests = window.Pager?.performSearchInput(value) || []

    onMount(() => {
        rem.on('toggleSearch', () => {
            if (!showSearch) {
                searchInput.focus()
                showSearch = true
            } else {
                searchInput.blur()
                showSearch = false
            }
        })
    })

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
    .input::placeholder {
        color: var(--controlGray);
    }

    .menu {
        font-size: 16px;
    }

    .search {
        flex-direction: row-reverse;
        -webkit-app-region: no-drag;
        width: fit-content;
        background-color: var(--controlBackground2);
        border-radius: 16px;
        padding: 0px 8px;
        transition: all 0.04s;
    }

    .search.focused {
        background-color: var(--controlWhite);
        box-shadow: 0px 0.5px 4px var(--fade);
        transform: scale(1.01);
    }

    .avatar-container {
        -webkit-app-region: no-drag;
        margin-right: 12px;
    }

    .Row {
        overflow: visible;
        position: relative;
    }

</style>

<div class="Row" style="-webkit-app-region: no-drag;">
    <div class="avatar-container">
        <Avatar
            on:click={show}
            size={'big'}
            isUrl={avatarUrl}
            avatar={avatarUrl || '\ue7fd'}
            width={32}
            height={32}
        />
    </div>

    <div class="Row search {showSearch ? 'focused' : ''}">
        <span class="iconfont icon-search avatar menu" on:click={performSearch}></span>
        
        <input type="text" class="input" {placeholder}
            spellcheck="false"
            bind:value
            bind:this={searchInput}
            on:click={() => {
                if (!showSearch) {
                    performSearchInput()
                }
                showSearch = true
            }}
            on:change={performSearch}
            on:input={performSearchInput}>
    </div>

    <Popup
        on:layerClick={hide}
        on:animIn={animIn}
        showPopupWindow={showPopup}
        cssText={"position: absolute; top: 64px; overflow: hidden;"}>
        <Profile
            bind:user={user}
        ></Profile>
    </Popup>

    <Popup
        layerColor='transparent'
        layerStyle='height: calc(100vh - 126px); top: 54px;'
        on:layerClick={() => showSearch = false}
        showPopupWindow={showSearch}
        cssText={"position: fixed; top: 56px; width: 360px; overflow: hidden; max-height: calc(100vh - 148px); min-height: 0; background-color: var(--controlWhite);"}>
        {#each suggests as group}
            <div></div>
        {/each}
    </Popup>
</div>