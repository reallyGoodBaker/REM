<script>
    import ScrollView2 from '../pages/components/ScrollView2.svelte'
    import ExtensionListTile from './ExtensionListTile.svelte'
    import { getPath } from '../utils/appPath/renderer'

    import { extensionManifests } from './initExtensionList'
    import { onDestroy, onMount } from 'svelte'
    import ExtensionMarket from './ExtensionMarketTile.svelte'
    import { getRoot, uninstall } from '../utils/ext-market/browser'
    import { notify } from '../utils/notification/browser'
    import { rem } from '../utils/rem';

    const s = v => langMapping.s(v)

    let manifests = extensionManifests.values()

    function isUrl(icon) {
        if (!icon) {
            return false
        }

        return icon.endsWith('.png')
    }

    async function createUrl(icon, folderName) {
        if (!icon) {
            return '\ue68b'
        }

        if (icon.startsWith('.')) {
            icon = icon.replace(/^\.\/(.*)/g, '$1')
        }

        if (icon.endsWith('.png')) {
            return `file://${await getPath('Extensions')}/${folderName}/${icon}`
        }
        
        return icon
    }

    const reload = () => manifests = extensionManifests.values()

    onMount(() => {
        Pager.setSearchPlaceholder('搜索插件')
        rem.on('reload-extension-list', reload)
    })

    onDestroy(() => rem.off('reload-extension-list', reload))

    function unist(id) {
        notify({
            icon: '\ue92b',
            title: s('uninstall'),
            message: `${s('uninstall')} ?`,
            channel: `ext_uninstall_${Math.random()}`,
            timeout: -1,
            controls: [
                { icon: '\ue876', label: '确认', onClick() {
                    uninstall(id)
                } },
                { icon: '\ue5cd', label: '取消' },
            ]
        })
    }
</script>

<style>
    .outer {
        width: 100%;
        height: 100%;
    }

    .inner {
        box-sizing: border-box;
        padding: 24px;
        display: grid;
        grid-template-rows: max-content;
        grid-template-columns: repeat(auto-fill, 400px);
        grid-gap: 10px 10px;
        width: 100vw;
        justify-items: center;
        align-items: start;
        justify-content: center;
    }
</style>

<div class="outer">
    <ScrollView2>
        <div class="Row inner">
            {#each Array.from(manifests) as {
                name, desc, ver, components, icon, id, folderName,
                activated, author,
            }}
            {#await createUrl(icon, folderName) then iconUrl}
            <ExtensionListTile
                on:uninstall={({ detail }) => unist(detail)}
                isUrl={isUrl(icon)}
                customClickListener={true}
                icon={iconUrl}
                {id}
                {name}
                {desc}
                {ver}
                {components}
                {author}
                checked={activated}
            />
            {/await}
            {/each}
            {#await getRoot() then extRoot}
            <ExtensionMarket root={extRoot}/>
            {/await}
        </div>
    </ScrollView2>
</div>