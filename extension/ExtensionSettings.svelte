<script>
    import { createEventDispatcher } from 'svelte'
    import Image from '../pages/components/Image.svelte'
    import RippleLayer from '../pages/components/RippleLayer.svelte'
    import Toggle from '../pages/components/Toggle.svelte'
    import { rem } from '../utils/rem'
    import ScrollView from '../pages/components/ScrollView2.svelte'
    import { extensionManifests } from './initExtensionList'
    import { getCustomSettings } from './host/setting-element';

    export let id = ''
    export let isUrl = false
    export let icon = '\ue68b'

    const customSettings = getCustomSettings(id)
    const extension = extensionManifests.get(id)

    const s = (f, ...args) => langMapping.s(f, ...args) || f
    let ver = extension.ver ?? '1.0'
    let desc = extension.desc ?? ''
    let name = extension.name ?? s('extensions')
    let components = extension.components ?? []
    let checked = extension.activated ?? false
    let author = extension.author ?? s('unknown')

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
</script>

<style>
    .header {
        position: sticky;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        background-color: var(--controlBrighter);
        overflow: hidden;
    }

    .info {
        box-sizing: border-box;
        padding: 24px;
        justify-content: space-between;
        width: 100%;
        background-color: var(--controlBackground2);
    }

    .name {
        font-size: larger;
        font-weight: bold;
    }

    .ver {
        font-weight: normal;
        font-style: italic;
        font-size: small;
        color: var(--controlBlack52);
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

    .selection {
        box-sizing: border-box;
        width: 100%;
        height: 48px;
        padding: 8px 24px;
        justify-content: space-between;
    }

    .card {
        border-radius: 12px;
        background-color: var(--controlBackground2);
        overflow: hidden;
    }

    .card_header {
        display: flex;
        align-items: center;
        gap: 24px;
        box-sizing: border-box;
        padding: 24px;
        border-bottom: solid 1px var(--controlBackground);
    }

    .card_list {
        box-sizing: border-box;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
    }

    .card_list_tile {
        padding: 2px 4px;

    }

    .card_list_tile[icon] {
        display: flex;
        align-items: center;
        position: relative;
        padding: 2px 4px;
        padding-left: 64px;
        color: var(--controlBlack24);
        user-select: text;
    }

    .card_list_tile[icon]::after {
        content: attr(icon);
        user-select: none;
        position: absolute;
        display: flex;
        align-items: center;
        left: 16px;
        height: 24px;
        font-size: small;
        font-weight: bold;
        color: var(--controlBlack12);
    }

    .container {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 24px;
        width: 100%;
        height: fit-content;
    }
</style>

<ScrollView>
<div class="container">
    <div class="header">
        <div class="Row info">
            <div class="Row" style="gap: 24px;">
                <div class="iconfont">
                    {#if isUrl}
                    <Image
                        alt=''
                        src={icon}
                        width={48}
                        height={48}
                        borderWidth={0}
                    />
                    {:else}
                        {icon}
                    {/if}
                </div>
                <div class="Column" style="justify-content: space-between; align-items: flex-start;">
                    <div class="name">{name}</div>
                    <div class="ver">{ver}</div>
                </div>
            </div>
            <RippleLayer rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
                <div class="iconfont i _btn red">{'\ue863'}</div>
            </RippleLayer>
        </div>
        <div class="Row selection">
            <div style="font-size: small;">{s(checked ? 'enabled': 'disabled')} {needRelaunch ? `(${s('need_to_do', s('relaunch'))})` : ''}</div>
            <div class="Row" style="gap: 8px;">
                {#if needRelaunch}
                    <RippleLayer rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
                        <div class="icon-round i _btn" on:click={relaunch}>{'\ue5d5'}</div>
                    </RippleLayer>
                {/if}
                <Toggle bind:checked on:toggle={onToggle}>
                    <span>{s('enable')}</span>
                </Toggle>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card_header">
            <div class="icon-round">{'\ue88e'}</div>
            <div>{s('info')}</div>
        </div>
        <div class="card_list">
            <div class="card_list_tile" icon="ID">{id}</div>
            <div class="card_list_tile" icon="{s('desc')}">{desc}</div>
            <div class="card_list_tile" icon="{s('author')}">{author}</div>
        </div>
    </div>

    <div class="card">
        <div class="card_header">
            <div class="icon-round">{'\ue002'}</div>
            <div>{s('permissions')}</div>
        </div>
        <div class="card_list">
            {#each components as component}
                <div class="card_list_tile" icon>{s('$' + component)}</div>
            {/each}
        </div>
    </div>

    {#if customSettings}
    <div class="card">
        <div class="card_header">
            <div class="icon-round">{'\ue8b8'}</div>
            <div>{s('settings')}</div>
        </div>
        <div class="card_list">
        {#each customSettings as { ctor, props, listeners }}
            <div class="card_list_tile" icon={props.icon ?? ''}>
                <!-- svelte-ignore missing-declaration -->
                <svelte:component
                    this={ctor}
                    {...props}
                    on:click={listeners.click ?? Function.prototype}
                    on:selected={listeners.selected ?? Function.prototype}
                    on:toggle={listeners.toggle ?? Function.prototype}
                    on:mousedown={listeners.mousedown ?? Function.prototype}
                    on:mouseup={listeners.mouseup ?? Function.prototype}
                    on:mousemove={listeners.mousemove ?? Function.prototype}
                    on:input={listeners.input ?? Function.prototype}
                    on:change={listeners.change ?? Function.prototype}
                    on:progressChange={listeners.progressChange ?? Function.prototype}
                    on:inputChange={listeners.inputChange ?? Function.prototype}/>
            </div>
        {/each}
    </div>
    </div>
    {/if}
</div>
</ScrollView>