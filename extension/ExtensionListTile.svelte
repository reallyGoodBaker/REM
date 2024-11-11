<script>
    import { createEventDispatcher } from 'svelte'
    import Image from '../pages/components/Image.svelte'
    import RippleLayer from '../pages/components/RippleLayer.svelte'
    import Toggle from '../pages/components/Toggle.svelte'
    import { rem } from '../utils/rem'
    import ExtensionSettings from './ExtensionSettings.svelte'

    const s = v => langMapping.s('$' + v) || v
    export let ver = '1.0'
    export let desc = ''
    export let isUrl = false
    export let icon = '\ue68b'
    export let name = langMapping.s('extensions')
    export let id = ''
    export let checked
    export let author = ''

    let needRelaunch = false
    const emit = createEventDispatcher()

    function onToggle() {
        emit('toggle', checked)
        hooks.send(`extension:${
            checked? 'active': 'deactive'
        }`, id)
    }

    export function toggle() {
        checked = !checked
        onToggle()
    }

    const refreshLaunchIcon = m => {
        if (m.id === id) {
            needRelaunch = true
        }
    }

    rem.on('extension:need-relaunch', refreshLaunchIcon)

    Pager.beforeSwitch(() => rem.off('extension:need-relaunch', refreshLaunchIcon))

    function relaunch() {
        hooks.send('app:relaunch')
    }

    function setting() {
        Pager.openNew(name, ExtensionSettings, { id, isUrl, icon })
    }
</script>

<style>
    .outer {
        width: 400px;
        height: 230px;
        box-sizing: border-box;
        border: solid 1px var(--controlGray);
        border-radius: 10px;
        overflow: hidden;
        background-color: var(--controlBrighter);
    }

    .i {
        width: 32px;
        height: 32px;
        font-size: 20px;
        color: var(--controlBlack24);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.1s;
    }

    .i._btn:hover {
        background-color: var(--fadeBright);
    }

    .i._btn.red:hover {
        color: darkred;
    }

    .btnGroup {
        justify-content: space-between;
        width: calc(100% - 28px);
        margin: 8px;
        margin-right: 20px;
    }

    .i._btn {
        cursor: pointer;
    }

    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: var(--controlBlack36);
        width: calc(100% - 22px);
        height: 100px;
        margin: 8px;
        margin-left: 14px;
    }

    .right-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-top: 18px;
        padding-bottom: 4px;
        margin-left: 68px;
        width: calc(100% - 68px);
        height: calc(100% - 24px);
        align-items: flex-start;
        justify-content: space-between;
    }

    .left-content {
        position: absolute;
        box-sizing: border-box;
        padding: 12px 0;
        justify-content: space-between;
        width: 56px;
        height: 100%;
        background-color: var(--controlBackgroundAcrylic);
    }

    .name {
        margin-left: 14px;
        font-weight: bold;
    }

    .ver {
        margin-left: 8px;
        font-weight: normal;
        font-style: italic;
        font-size: small;
        color: var(--controlBlack52);
    }

    .author {
        width: calc(100% - 22px);
        margin-left: 14px;
        font-size: small;
    }

    .id {
        font-size: small;
    }
</style>

<div class="Row outer">

    <div class="Column left-content">
        <div class="iconfont i">
            {#if isUrl}
            <Image
                alt=''
                src={icon}
                width={24}
                height={24}
                borderWidth={0}
            />
            {:else}
                {icon}
            {/if}
        </div>

        <RippleLayer rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
            <div on:click={() => emit('uninstall', id)} class="iconfont i _btn red">{'\ue863'}</div>
        </RippleLayer>
    </div>


    <div class="Row right-content">
        <div>
            <div class="name">{name}<span class="ver">{ver}</span></div>
            {#if author}
                <div class="author">{author}</div>
            {/if}
        </div>
        <div class="content">
            {desc}
            <div class="id">ID: {id}</div>
        </div>
        <div class="Row btnGroup">
            <div class="Row">
                <RippleLayer rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
                    <div class="iconfont i _btn" on:click={setting}>{'\ue6aa'}</div>
                </RippleLayer>
                {#if needRelaunch}
                    <RippleLayer rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
                        <div class="icon-round i _btn" on:click={relaunch}>{'\ue5d5'}</div>
                    </RippleLayer>
                {/if}
            </div>

            <Toggle on:toggle={onToggle} bind:checked={checked}/>
        </div>
    </div>
    
</div>
