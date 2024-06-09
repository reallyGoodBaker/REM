import { invoker } from "../../../utils/main-invoker/browser.js"
import { rem } from "../../../utils/rem.js"
import { safeStore } from "../../../utils/stores/base.js"
import { getPath } from '../../../utils/appPath/renderer.js'

const settings = new Map()
const settingEntries = new Map()

async function call(func, ...args) {
    if (typeof func === 'function') {
        return await func.apply(null, args)
    }

    return null
}

export async function loadExtensionSettings(m) {
    const path = m.settings

    if (!m.id || !path) {
        return
    }

    const settingEntry = await import(
        `file://${await getPath('Extensions')}/${m.folderName}/${path}`
    )

    settingEntries.set(m.id, settingEntry)

    if (!settingEntry.onSetting) {
        return
    }

    const store = safeStore(`ExtensionSettings/${m.id}`)
    const setting = await call(settingEntry.onSetting, store)
    settings.set(m.id, { setting, store })

    const setValue = async (id, name, value) => {
        if (m.id !== id) {
            return
        }

        value = value ?? {}

        await call(settingEntry.onSetSetting, store, name, value)
    }

    const getValue = async (id, name) => {
        if (m.id !== id) {
            return undefined
        }

        return await call(settingEntry.onGetSetting, store, name)
    }

    invoker.handle('ext.settings:get', (_, id) => settings.get(id)?.setting)
    invoker.handle('ext.setting:get', (_, id, name) => getValue(id, name))
    invoker.handle('ext.settings:set', (_, id, name, setting) => setValue(id, name, setting))
    rem.on('ext.settings:set', setValue)
}

export function getExtensionSettings(id) {
    return settings.get(id)?.setting
}

export function getExtSetting(id, name) {
    return call(settingEntries.get(id)?.onGetSetting, settings.get(id)?.store, name)
}

export function setExtSetting(id, name, value) {
    rem.emitNone('ext.settings:set', id, name, value)
}