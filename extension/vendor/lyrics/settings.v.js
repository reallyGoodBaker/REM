import { TextField, ToggleField } from "../../runtime/ui/settings.js"

export const lyricsExtensionSettings = {
    currentFontSize: 'x-large',
    nextFontSize: 'larger',
    showRomaLyric: false,
    showTranslatedLyric: false,
}

let _settings

export async function onSetting(safeStore) {
    _settings = safeStore
    const settings = await safeStore.get()
    if (!settings) {
        safeStore.set(lyricsExtensionSettings)
    } else {
        Object.assign(lyricsExtensionSettings, settings)
    }

    return [
        TextField(
            '当前歌词字体大小',
            lyricsExtensionSettings.currentFontSize,
            'currentFontSize'
        ),
        TextField(
            '下一句歌词字体大小',
            lyricsExtensionSettings.nextFontSize,
            'nextFontSize'
        ),
        ToggleField(
            '显示罗马音',
            lyricsExtensionSettings.showRomaLyric,
            'showRomaLyric'
        ),
        ToggleField(
            '显示中文翻译',
            lyricsExtensionSettings.showTranslatedLyric,
            'showTranslatedLyric'
        )
    ]
}

export function onSetSetting(name, value) {
    lyricsExtensionSettings[name] = value
    _settings.set(lyricsExtensionSettings)
}

export function onGetSetting(name) {
    return lyricsExtensionSettings[name]
}