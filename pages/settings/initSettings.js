import { store } from "../../utils/stores/base"
import { Lang } from '../../utils/lang/lang.js'
import { setClearFont } from "../../utils/style/font"
import { rem } from "../../utils/rem"
import { hue } from '../../utils/math.js'
import { invoker } from '../../utils/main-invoker/browser.js'

function lang(key) {
    return langMapping.s(key)
}

/**
 * @type {<T>(name: string, defaultValue: T, init: (val: T) => void) => void}
 */
function init(name, defaultValue, init) {
    let val = store.getSync(name)

    if (!val) {
        val = defaultValue
        store.set(name, val)
    }

    if (typeof init === 'function') {
        init.call(null, val)
    }
}

export function initSettings() {
    init('AppSettings/beta_features', {
        showDevTools: false,
        useBufferOutput: false,
    }, ({ showDevTools }) => {
        hooks.send(`devtools:${
            showDevTools ? 'open': 'close'
        }`)
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
        selected: 5,
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

    let theme = {}
    init('AppSettings/theme', {
        colors: [ {label: '跟随系统'}, 2, 39, 148, 210, 270, 292, 322],
        selected: 4,
    }, async ({ colors, selected }) => {
        const setColor = color => document.body.style.setProperty('--controlHue', color)
        const sysTheme = await hooks.invoke('win:sys-colors')
        const sysHue = selected ? colors[selected] : hue(sysTheme.accent)
        theme = { colorHue: sysHue, dark: sysTheme.dark } 
        setColor(sysHue)
        rem.on('changeControlColor', setColor)
        invoker.handle('app?theme', () => theme)
    })

    init('AppSettings/font', {
        clearFont: false
    }, val => {
        setClearFont(val.clearFont)
    })
}