import { store } from "../../utils/stores/base"
import { Lang } from '../../utils/lang/lang.js'

function lang(key) {
    return langMapping.s(key)
}

function init(name, defaultValue) {
    let val = store.getSync(name)

    if (!val) {
        val = defaultValue
        store.set(name, val)
    }
}

export function initSettings() {
    init('AppSettings/beta_features', {
        showDevTools: false,
        extensions: false,
    })

    init('AppSettings/cache', {
        qualities: [
            { label: '鲸云母带', value: 'jymaster' },
            { label: '鲸云臻音', value: 'jyeffect' },
            { label: 'Hi-Res', value: 'hires' },
            { label: '无损', value: 'lossless' },
            { label: '极高', value: 'exhigh' },
            { label: '高', value: 'higher' },
            { label: '普通', value: 'standard' }
        ],
        selected: 0,
    })

    init('AppSettings/lang', {
        langs: [...Object.keys(Lang.langs)],
        selected: 'zh_cn'
    })

    init('AppSettings/left_stick', {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    })

    init('AppSettings/right_stick', {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    })

    init('AppSettings/theme', {
        colors: [2, 39, 148, 210, 270, 292, 322],
        selected: 3,
        useAcrylic: false
    })
}