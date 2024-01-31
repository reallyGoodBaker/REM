export const lyricsExtensionSettings = {
    currentFontSize: 'x-large',
    nextFontSize: 'larger',
    showRomaLyric: false,
    showTranslatedLyric: false,
}

export async function onSetting({ safeStore }) {
    const settings = await safeStore.get()
    if (!settings) {
        safeStore.set(lyricsExtensionSettings)
    } else {
        Object.assign(lyricsExtensionSettings, settings)
    }

    return [
        {
            type: 'input',
            props: {
                label: '当前歌词字体大小',
                value: lyricsExtensionSettings.currentFontSize,
            },
            listeners: {
                change: ({ detail }) => {
                    lyricsExtensionSettings.currentFontSize = detail
                    safeStore.set(lyricsExtensionSettings)
                }
            }
        },

        {
            type: 'input',
            props: {
                label: '下一句歌词字体大小',
                value: lyricsExtensionSettings.nextFontSize,
            },
            listeners: {
                change: (ev) => {
                    const { detail } = ev
                    lyricsExtensionSettings.nextFontSize = detail
                    safeStore.set(lyricsExtensionSettings)
                }
            }
        },

        {
            type: 'toggle',
            props: {
                label: '显示罗马音',
                checked: lyricsExtensionSettings.showRomaLyric,
            },
            listeners: {
                toggle: ({ detail }) => {
                    lyricsExtensionSettings.showRomaLyric = detail
                    safeStore.set(lyricsExtensionSettings)
                }
            }
        },

        {
            type: 'toggle',
            props: {
                label: '显示翻译',
                checked: lyricsExtensionSettings.showTranslatedLyric,
            },
            listeners: {
                toggle: ({ detail }) => {
                    lyricsExtensionSettings.showTranslatedLyric = detail
                    safeStore.set(lyricsExtensionSettings)
                }
            }
        },
    ]
}