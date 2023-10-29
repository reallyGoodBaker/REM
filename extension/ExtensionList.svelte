<script>
    import ScrollView2 from '../pages/components/ScrollView2.svelte'
    import ExtensionListTile from './ExtensionListTile.svelte'

    import { getManifests } from './initExtensionList'
    import { onMount } from 'svelte'

    const s = v => langMapping.s(v)
    let manifests = getManifests()

    function isUrl(icon) {
        if (!icon) {
            return false
        }

        return icon.endsWith('.png')
    }

    function createUrl(icon, folderName) {
        if (!icon) {
            return '\ue68b'
        }

        if (icon.startsWith('.')) {
            icon = icon.replace(/^\.\/(.*)/g, '$1')
        }

        if (icon.endsWith('.v.png')) {
            return `file://${AppPaths.ExtVendor}/${folderName}/${icon}`
        }
        
        if (icon.endsWith('.png')) {
            return `file://${AppPaths.Extensions}/${folderName}/${icon}`
        }
        
        return icon
    }

    onMount(() => {
        Pager.setSearchPlaceholder('搜索插件')
    })
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
            {#each manifests as {
                name, desc, ver, components, icon, id, folderName,
                activated,
            }}
            <ExtensionListTile
                isUrl={isUrl(icon)}
                customClickListener={true}
                icon={createUrl(icon, folderName)}
                {id}
                {name}
                {desc}
                {ver}
                {components}
                checked={activated}
            />
            {/each}
        </div>
    </ScrollView2>
</div>