<script>
import ScrollView from './components/ScrollView2.svelte'
import Input from './components/Input.svelte'
import { onMount, tick } from 'svelte';

import SettingBeta from './settings/SettingBeta.svelte'
import SettingTheme from './settings/SettingTheme.svelte'
import SettingCache from './settings/SettingCache.svelte'
import SettingStick from './settings/SettingStick.svelte'
import SettingOutput from './settings/SettingOutput.svelte'
import SettingLang from './settings/SettingLang.svelte'
import SettingFont from './settings/SettingFont.svelte'

import { rem } from '../utils/rem.js'

let scrollv
Pager.beforeSwitch(() => {
    if (scrollv?.prepared()) {
        const {save} = Pager.getContext()
        save.offsetRatio = scrollv.getOffsetRatio()
    }
})

const lang = s => langMapping.s(s)

function fresh() {
    Pager.select(Pager.index(), true)
}

onMount(async () => {
    Pager.setSearchPlaceholder('搜索设置')

    rem.once('langChange', fresh)

    const {save} = Pager.getContext()
    await tick()
    
    if (save.offsetRatio) {
        scrollv.setOffsetRatio(save.offsetRatio)
    }
    
})
</script>

<style>
    .c {
        justify-content: flex-start;
        align-items: flex-start;
        margin: 24px 12px;
    }

</style>


<ScrollView><div class="row c">

    <SettingBeta/>
    <SettingTheme/>
    <SettingCache/>
    <SettingStick/>
    <SettingOutput/>
    <SettingLang/>
    <SettingFont/>

</div></ScrollView>