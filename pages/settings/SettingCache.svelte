<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import ListTile from "../components/ListTile.svelte"
    import { store } from '../../utils/stores/base.js'
    import { notify } from "../../utils/notification/notification-utils.js"
    
    $: lang = window.langMapping

    let {qualities, selected} = store.getSync('AppSettings/cache')

    function onSelectedControlColor({detail}) {
        selected = detail
        store.set('AppSettings/cache', {qualities, selected})
    }

    function clearCache() {
        notify({
            icon: '\ue92b',
            title: lang.s('cache'),
            message: `${lang.s('clear_usr_data')} ?\n${lang.s('clear_usr_data_extra')}`,
            channel: 'alert_clearCache',
            timeout: -1,
            controls: [
                { icon: '\ue876', label: '确认', onClick() { store.clear() } },
                { icon: '\ue5cd', label: '取消' },
            ]
        })
    }

    function clearMusicCache() {
        notify({
            title: lang.s('cache'),
            message: `${lang.s('clear_cache')} ?`,
            icon: '\ue92b',
            channel: 'alert_clearMusicCache',
            timeout: -1,
            controls: [
                { icon: '\ue876', label: '确认', onClick() { server.clearAllCache() } },
                { icon: '\ue5cd', label: '取消' },
            ]
        })
    }
</script>

<RowList title={lang.s('cache')}>
    <SelectListTile
        data={lang.s('cache_quality')}
        bind:dataList={qualities}
        bind:selected={selected}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectedControlColor}
    />
    <ListTile
        useAvatar={false}
        bold={true}
        data={lang.s('clear_usr_data')}
        extra={lang.s('clear_usr_data_extra')}
        on:click={clearCache}
    />
    <ListTile
        useAvatar={false}
        bold={true}
        data={lang.s('clear_cache')}
        on:click={clearMusicCache}
    />
    
</RowList>