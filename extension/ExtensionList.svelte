<script>
    import ScrollView2 from '../pages/components/ScrollView2.svelte'
    import ExtensionListTile from './ExtensionListTile.svelte'
    import Input from '../pages/components/Input.svelte'

    const s = v => langMapping.s(v)

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

        <ExtensionListTile
            isUrl={false}
            customClickListener={true}
            avatar={'\ue68b'}
            data={s('extensions')}
            desc={'wow'}
            permissions={[
                "audio_control",
                "notification",
                "new_page"
            ]}
        />
    </ScrollView2>
</div>