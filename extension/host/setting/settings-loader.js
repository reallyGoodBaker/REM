import { invoker } from "../../../utils/main-invoker/browser.js"
import { rem } from "../../../utils/rem.js"
import { safeStore } from "../../../utils/stores/base.js"

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
        `file://${path.endsWith('.v.js')
            ? AppPaths.ExtVendor
            : AppPaths.Extensions}/${m.folderName}/${path}`
    )

    settingEntries.set(m.id, settingEntry)

    if (!settingEntry.onSetting) {
        return
    }

    const setting = await call(settingEntry.onSetting, safeStore(`ExtensionSettings/${m.id}`))
    settings.set(m.id, setting)

    const setValue = async (id, name, value) => {
        if (m.id !== id) {
            return
        }

        value = value ?? {}

        await call(settingEntry.onSetSetting, name, value)
    }

    const getValue = async (id, name) => {
        if (m.id !== id) {
            return undefined
        }

        return await call(settingEntry.onGetSetting, name)
    }

    invoker.handle('ext.settings:get', (_, id) => settings.get(id))
    invoker.handle('ext.setting:get', (_, id, name) => getValue(id, name))
    invoker.handle('ext.settings:set', (_, id, name, setting) => setValue(id, name, setting))
    rem.on('ext.settings:set', setValue)
}

export function getExtensionSettings(id) {
    return settings.get(id)
}

export function getExtSetting(id, name) {
    return call(settingEntries.get(id)?.onGetSetting, name)
}

export function setExtSetting(id, name, value) {
    rem.emitNone('ext.settings:set', id, name, value)
}