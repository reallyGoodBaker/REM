export { onSetting } from "./settings.js"

let safeStore

export function onLoad({ AudioPlayer, Playlist, store, safeStore: sf }) {
    globalThis.AudioPlayer = AudioPlayer
    globalThis.Playlist = Playlist
    globalThis.store = store
    safeStore = sf
}

export async function onReady() {
    addCustomUI(await safeStore.get())
    await requestLyrics()
    setupLoop()

    AudioPlayer.on('metadata', requestLyrics)
}

let currentLyricsBody = null
let lyrics = []
    ,tlrc = []
    ,romalrc = []

async function requestLyrics() {
    const lyricsReq = await NeteaseApi.getLyrics(
        AudioPlayer.audioData.data.id,
        await store.get('cookie')
    )

    if (lyricsReq.status !== 200) {
        return
    }

    currentLyricsBody = lyricsReq.body

    lyrics = parseLyrics(currentLyricsBody.lrc.lyric)
    tlrc = parseLyrics(currentLyricsBody.tlyric.lyric)
    romalrc = parseLyrics(currentLyricsBody.romalrc.lyric)
}

function parseLyrics(txt) {
    if (!txt.trim()) {
        return []
    }

    const lines = txt.trim().split('\n')
    const regExp = /\[(.*)\](.*)/

    return lines.map(line => {
        const [ _, timeStamp, lyric ] = regExp.exec(line)
        let [ m, s, rad ] = timeStamp.split(':')
        
        m = parseInt(m) || 0
        s = parseInt(s) || 0
        rad = parseInt(rad) || 0

        return {
            time: m * 60 + s + rad / 100,
            lyric: lyric.trim()
        }
    }).filter(({ lyric }) => lyric.trim())
}

const layer = document.getElementById('surface-layer')
const div = document.createElement('div')
export const currentEle = document.createElement('div')
export const nextEle = document.createElement('div')
const topBottom = document.createElement('div')

let attachBottom = true

function addCustomUI({
    currentFontSize,
    nextFontSize,
    showRomaLyric,
    showTranslatedLyric,
}) {
    div.style.cssText = `
    box-sizing: border-box;
    position: fixed;
    right: 20px;
    bottom: 8px;
    width: max-content;
    min-width: 300px;
    height: fit-content;
    border-radius: 12px;
    border: solid 1px var(--controlGray);
    background-color: var(--controlBrighter);
    padding: 12px;
    display: flex;
    flex-direction: column;
    user-select: text;
    pointer-events: all;
    color: var(--controlBlack24);
    `

    currentEle.style.cssText = `
    padding: 4px 56px 8px;
    padding-left: 0;
    font-size: ${currentFontSize || 'x-large'};
    font-weight: bold;
    align-self: flex-start;
    `

    nextEle.style.cssText = `
    font-size: ${nextFontSize || 'larger'};
    padding-left: 56px;
    align-self: flex-end;
    color: var(--controlBlack52);
    `

    topBottom.style.cssText = `
    font-size: large;
    width: 32px;
    height: 32px;
    justify-content: center;
    opacity: 0;
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 0;
    border-radius: 4px;
    user-select: none;
    `
    topBottom.classList.add('Row', 'new-icon', 'btn', 'text')
    topBottom.innerText = '\ue5d8'

    div.addEventListener('mouseenter', () => {
        topBottom.style.opacity = 1
    })
    div.addEventListener('mouseleave', () => {
        topBottom.style.opacity = 0
    })
    topBottom.addEventListener('click', () => {
        if (attachBottom) {
            div.style.bottom = ''
            div.style.top = '92px'
        } else {
            div.style.bottom = '8px'
            div.style.top = ''
        }

        attachBottom = !attachBottom
        topBottom.innerText = attachBottom ? '\ue5d8' : '\ue5db'
    })

    div.appendChild(currentEle)
    div.appendChild(nextEle)
    div.appendChild(topBottom)

    layer.appendChild(div)
}

function renderLyrics(lyrics) {
    const _time = AudioPlayer.seek()

    let _currentLyric = ''
        ,_nextLyric = ''

    for (let i = 0; i < lyrics.length; i++) {
        const { time, lyric } = lyrics[i]
        const { time: nextTime, lyric: nextLyric } = lyrics[i + 1] || { time: Infinity, lyric: '' }

        if (_time >= time && _time < nextTime) {
            _currentLyric = lyric
            _nextLyric = nextLyric
            break
        }
    }

    if (currentEle.innerText !== _currentLyric) {
        currentEle.innerText = _currentLyric
        nextEle.innerText = _nextLyric
    }
}

function setupLoop() {
    return setInterval(() => {
        renderLyrics(lyrics)
    }, 100)
}