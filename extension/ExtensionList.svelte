<script>
    import ScrollView2 from '../pages/components/ScrollView2.svelte'
    import ExtensionListTile from './ExtensionListTile.svelte'
    import Input from '../pages/components/Input.svelte'

    import {getManifests} from './initExtensionList'

    const s = v => langMapping.s(v)
    const manifests = getManifests()

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

</script>

<style>
    .outer {
        width: 400px;
        height: 100%;
    }

    h1 {
        margin: 0;
        margin-left: 24px;
        margin-bottom: 12px;
        margin-top: 12px;
        font-weight: normal;
    }

    .header {
        justify-content: space-between;
        padding-right: 8px;
        margin-bottom: 8px;
        margin-top: 12px;
    }
</style>

<div class="outer">
    <ScrollView2>
        <div class="Row header">
            <h1>{s('extensions')}</h1>
            <Input placeholder="搜索插件" cssText="width: 100px"/>
        </div>

        {#each manifests as {name, desc, ver, components, icon, id, folderName}}
        <ExtensionListTile
            isUrl={isUrl(icon)}
            customClickListener={true}
            icon={createUrl(icon, folderName)}
            {id}
            {name}
            {desc}
            {ver}
            {components}
        />
        {/each}
    </ScrollView2>
</div>