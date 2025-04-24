import { store } from "../../utils/stores/base"
import { Lang } from '../../utils/lang/lang.js'
import { setClearFont } from "../../utils/style/font"
import { rem } from "../../utils/rem"
import { hue } from '../../utils/math.js'
import { invoker } from '../../utils/main-invoker/browser.js'
import { indexOfOutputDevice, setPluginOutput } from "../../utils/devices/browser/output"
import { getAudioDevices } from '../../utils/devices/browser/find'

function lang(key) {
    return langMapping.s(key)
}

/**
 * @type {<T>(name: string, defaultValue: T, init: (val: T) => void) => void}
 */
export function __init_setting(name, defaultValue, init) {
    let val = store.getSync(name)

    if (!val) {
        val = defaultValue
        store.set(name, val)
    }

    const setDefault = async () => {
        await store.set(name, defaultValue)
        return defaultValue
    }

    if (typeof init === 'function') {
        init.call(null, val, setDefault)
    }
}

export let theme = {}

export function initSettings() {
    __init_setting('AppSettings/beta_features', {
        showDevTools: false,
        useBufferOutput: false,
        showNetworkErrors: false,
    }, ({ showDevTools }) => {
        hooks.send(`devtools:${
            showDevTools ? 'open': 'close'
        }`)
    })

    __init_setting('AppSettings/cache', {
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

    __init_setting('AppSettings/lang', {
        langs: [...Object.keys(Lang.langs)],
        selected: 'zh_cn'
    })

    __init_setting('AppSettings/left_stick', {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    })

    __init_setting('AppSettings/right_stick', {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    })

    __init_setting('AppSettings/theme', {
        colors: [ {label: '跟随系统'}, 2, 39, 148, 210, 270, 292, 322],
        dark: [ {label: '跟随系统'}, {label: 'light', value: false}, {label: 'dark', value: true}],
        selected: 4,
        selectedDark: 1
    }, async ({ colors, selected, dark, selectedDark }) => {
        const setColor = color => document.body.style.setProperty('--controlHue', color)
        const setDarkMode = darkMode => darkMode
                ? document.body.classList.add('dark-mode')
                : document.body.classList.remove('dark-mode')

        const sysTheme = await hooks.invoke('win:sys-colors')
        if (!selected || !selectedDark) {
            if (!sysTheme) {
                selected = 1
                selectedDark = 1
                await store.set('AppSettings/theme', {
                    colors, selected, dark, selectedDark
                })
            }
        }

        const sysHue = selected ? colors[selected] : hue(sysTheme.accent)
        const darkMode = selectedDark ? dark[selectedDark].value : sysTheme.dark
        theme = { colorHue: sysHue, dark: darkMode } 
        setColor(sysHue)
        setDarkMode(darkMode)
        rem.on('changeControlColor', setColor)
        rem.on('changeDarkMode', setDarkMode)
        invoker.handle('app?theme', () => theme)
    })

    __init_setting('AppSettings/font', {
        clearFont: false
    }, val => {
        setClearFont(val.clearFont)
    })

    __init_setting('AppSettings/output', {
        pluginOutput: false,
        sampleRate: 48000,
    }, async ({ pluginOutput, sampleRate }) => {
        const { promise, resolve } = Promise.withResolvers()
        const wrap = d => ({
            label: d.label.includes(' -') ? d.label.replace(/^.* - /, '') : d.label,
            deviceId: d.deviceId, 
        })

        let deviceRef = new Proxy({ value: null }, {
            get(target, prop) {
                return target[prop]
            },
            set(target, prop, value) {
                if (!target[prop]) {
                    resolve(wrap(value))
                }
                target[prop] = value
                return true
            }
        })

        invoker.handle('output?pluginOutput', () => pluginOutput)
        invoker.handle('output?device', () => {
            if (deviceRef.value) {
                return wrap(deviceRef.value)
            }

            return promise
        })
        rem.on('setOutputDevice', d => {
            deviceRef.value = d
            hooks.send('output:setOutputDevice', d)
        })
        rem.on('setPluginOutput', pluginOutput => {
            hooks.send('output:setPluginOutput', pluginOutput)
            setPluginOutput(pluginOutput)
        })

        const devices = await getAudioDevices()
        const selected = await indexOfOutputDevice(devices)
        rem.emitNone('setOutputDevice', devices[selected])
        rem.emitNone('setPluginOutput', pluginOutput)
    })
}