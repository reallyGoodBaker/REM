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
    }

    .grid-margin {
        margin: 0px 24px;
    }

    h1 {
        font-weight: normal;
    }

</style>


<ScrollView bind:this={scrollv}><div class="row c">
    <div class="column grid-margin" style="justify-content: space-between; width: calc(100% - 48px)">
        <h1>{lang('settings')}</h1>
        <Input
            placeholder={'\ue6a8  ' + lang('settings_search')}
            fullBorder={true}
        />
    </div>

    <SettingBeta/>
    <SettingTheme/>
    <SettingCache/>
    <SettingStick/>
    <SettingOutput/>
    <SettingLang/>

</div></ScrollView>