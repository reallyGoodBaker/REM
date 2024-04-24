import { onSetting, lyricsExtensionSettings } from "./settings.v.js"
export { onSetting }

export function onLoad({ AudioPlayer, Playlist, store }) {
    globalThis.AudioPlayer = AudioPlayer
    globalThis.Playlist = Playlist
    globalThis.store = store
}

export async function onReady() {
    addCustomUI()
    await tryRequestLyrics()
    setupLoop()

    AudioPlayer.on('loadedContent', tryRequestLyrics)
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
        lyrics = []
        tlrc = []
        romalrc = []
        return
    }

    currentLyricsBody = lyricsReq.body

    lyrics = parseLyrics(currentLyricsBody.lrc.lyric)
    tlrc = parseLyrics(currentLyricsBody.tlyric.lyric)
    romalrc = parseLyrics(currentLyricsBody.romalrc.lyric)
}

async function tryRequestLyrics() {
    try {
        await requestLyrics()
    } catch {
        currentLyricsBody = null
        lyrics = []
        tlrc = []
        romalrc = []
    }
}

function parseLyrics(txt) {
    if (!txt.trim()) {
        return [{ time: Infinity, lyric: '' }]
    }

    const lines = txt.trim().split('\n')
    const regExp = /\[(.*)\](.*)/

    const lyrics = lines.map(line => {
        const [ _, timeStamp, lyric ] = regExp.exec(line)
        let [ m, s, rad ] = timeStamp.split(/[:\.]/)
        
        m = parseInt(m) || 0
        s = parseInt(s) || 0
        rad = parseInt(rad) || 0

        return {
            time: m * 60 + s + rad / 1000,
            lyric: lyric.trim()
        }
    })

    lyrics.push({ time: Infinity, lyric: '' })

    return lyrics
}

const layer = document.getElementById('surface-layer')
const div = document.createElement('div')
export const currentEle = document.createElement('div')
export const nextEle = document.createElement('div')
const topBottom = document.createElement('div')

let attachBottom = true

function addCustomUI() {
    const {
        currentFontSize,
        nextFontSize,
    } = lyricsExtensionSettings

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
    display: flex;
    flex-direction: column;
    padding: 4px 56px 8px;
    padding-left: 0;
    font-size: ${currentFontSize || 'x-large'};
    font-weight: bold;
    align-self: flex-start;
    min-height: 32px;
    `

    nextEle.style.cssText = `
    display: flex;
    flex-direction: column;
    font-size: ${nextFontSize || 'larger'};
    padding-left: 56px;
    align-self: flex-end;
    color: var(--controlBlack52);
    min-height: 20px;
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

function findSuitableLyrics(_time, lyrics) {
    let _currentLyric = ''
        ,_nextLyric = ''

    for (let i = 0; i < lyrics.length - 1; i++) {
        const { time, lyric } = lyrics[i]
        const { time: nextTime, lyric: nextLyric } = lyrics[i + 1]

        if (i === 0 && _time < time) {
            _nextLyric = lyric
            break
        }

        if (_time >= time && _time < nextTime) {
            _currentLyric = lyric
            _nextLyric = nextLyric
            break
        }
    }

    return [ _currentLyric, _nextLyric ]
}

function renderLyrics() {
    const _time = AudioPlayer.seek()

    const {
        currentFontSize,
        nextFontSize,
        showRomaLyric,
        showTranslatedLyric,
    } = lyricsExtensionSettings

    currentEle.style.fontSize = currentFontSize
    nextEle.style.fontSize = nextFontSize

    const [ currentLyric, nextLyric ] = findSuitableLyrics(_time, lyrics)

    let currentEleHtml = ''
        ,nextEleHtml = ''

    if (showRomaLyric) {
        const [ currentRomaLyric, nextRomaLyric ] = findSuitableLyrics(_time, romalrc)
        currentEleHtml += `<div style="font-size: 0.8em;">${currentRomaLyric}</div>`
        nextEleHtml += `<div style="font-size: 0.8em;">${nextRomaLyric}</div>`
    }

    currentEleHtml += `<div>${currentLyric}</div>`
    nextEleHtml += `<div>${nextLyric}</div>`

    if (showTranslatedLyric) {
        const [ currentRomaLyric, nextRomaLyric ] = findSuitableLyrics(_time, tlrc)
        currentEleHtml += `<div style="font-size: 0.8em;">${currentRomaLyric}</div>`
        nextEleHtml += `<div style="font-size: 0.8em;">${nextRomaLyric}</div>`
    }

    if (currentEle.innerHTML !== currentEleHtml) {
        currentEle.innerHTML = currentEleHtml
    }

    if (nextEle.innerHTML !== nextEleHtml) {
        nextEle.innerHTML = nextEleHtml
    }
}

function setupLoop() {
    return vsync(renderLyrics)
}