import { invoker } from "../../../utils/main-invoker/browser.js"
import { rem } from "../../../utils/rem.js"
import { safeStore } from "../../../utils/stores/base.js"
import { getPath } from '../../../utils/appPath/renderer.js'

const settingEntries = new Map()

function settingStore(id) {
    return safeStore(`ExtensionSettings/${id}`)
}

async function call(func, ...args) {
    if (typeof func === 'function') {
        return await func.apply(null, args)
    }

    return null
}

async function getSettingEntry(m) {
    let setting = settingEntries.get(m.id)
    if (!setting) {
        const settingEntry = await import(
            `file://${await getPath('Extensions')}/${m.folderName}/${m.settings}`
        )
        settingEntries.set(m.id, setting = settingEntry)
    }

    return setting
}

function getSettingEntryById(id) {
    return settingEntries.get(id)
}

async function getSettingUI(m) {
    const entry = await getSettingEntry(m)
    const store = settingStore(m.id)

    return await call(entry.onSetting, store)
}

export async function loadExtensionSettings(m) {
    if (!m.id || !m.settings) {
        return
    }

    const settingEntry = await getSettingEntry(m)
    if (!settingEntry.onSetting)
        return

    const setValue = async (id, name, value) => {
        if (m.id !== id) {
            return
        }

        value = value ?? {}
        await call(settingEntry.onSetSetting, settingStore(m.id), name, value)
    }

    // invoker.handle('ext.settings:get', (_, id) => settings.get(id)?.setting)
    // invoker.handle('ext.setting:get', (_, id, name) => getValue(id, name))
    // invoker.handle('ext.settings:set', (_, id, name, setting) => setValue(id, name, setting))
    rem.on('ext.settings:set', setValue)
}

export function getExtensionSettings(m) {
    return getSettingUI(m)
}

export function getExtSetting(id, name) {
    return call(getSettingEntryById(id)?.onGetSetting, settingStore(id), name)
}

export function setExtSetting(id, name, value) {
    rem.emitNone('ext.settings:set', id, name, value)
}