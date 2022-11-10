import {EventEmitter} from '../events.js'
import {initAudioDevicesFind} from '../devices/browser/find.js'
import {initOutputAudio} from '../devices/browser/output.js'
import {fadeBeforePause, fadeBeforePlay, initProcessor} from './process.js'
import {initAncProcessor} from './anc.js'
import {rem} from '../rem.js'

initAudioDevicesFind()

export class AudioPlayer {

    static audioCtx = new AudioContext()
    static audioElement = new Audio()
    static em = new EventEmitter()

    static on(type, handler) {
        this.em.on(type, handler)
    }
    on(type, handler) {
        AudioPlayer.on(type, handler)
    }

    static async play() {
        this.em.emit('play')

        hooks.send('thumbar:pause')

        return await Promise.all([
            this.audioElement.play(),
            fadeBeforePlay()
        ])
    }
    play() {
        return AudioPlayer.play()
    }

    static pause() {
        fadeBeforePause().then(() => {
            this.audioElement.pause()
        })

        hooks.send('thumbar:play')

        this.em.emit('pause')
    }
    pause() {
        AudioPlayer.pause()
    }

    static seek(time) {
        if (typeof time === 'number') this.audioElement.currentTime = time
        else return this.audioElement.currentTime
        this.em.emit('seek')
    }
    seek(time) {
        return AudioPlayer.seek(time)
    }

    static load(source) {
        if (source) {
            this.audioElement.src = source
        }
        return this.audioElement.src
    }
    load(source) {
        return AudioPlayer.load(source)
    }

    async loadData(audioData) {
        audioData.onLoadMetadata = metadata => {
            AudioPlayer.metadata = metadata
            rem.emit('metadata', metadata)
        }

        AudioPlayer.audioData = audioData
    
        this.load(await audioData.url())
        this.onDataLoaded()
    }

    onDataLoaded() {

    }

    static volume(number) {
        if (typeof number === 'undefined') return this.audioElement.volume

        if (typeof number === 'number') {
            
            if (number > 0) {
                this.audioElement.muted = false
                this.audioElement.volume = number
            } else {
                this.audioElement.muted = true
            }

            return
        }

    }
    volume(number) {
        return AudioPlayer.volume(number)
    }

    static duration() {
        return this.audioElement.duration || (this.audioData?.data.dt / 1000) || 0
    }
    duration() {
        return AudioPlayer.duration()
    }

    static isPlaying() {
        return !this.audioElement.paused
    }
    isPlaying() {
        return AudioPlayer.isPlaying()
    }

    static metadata = {}
    getMetadata() {
        return Object.assign({}, AudioPlayer.metadata)
    }
}

AudioPlayer.audioElement.addEventListener('ended', () => {
    AudioPlayer.em.emit('ended')
})

AudioPlayer.audioElement.onloadedmetadata = () => {
    rem.emit('setControlsContent', AudioPlayer.audioData)
}

const srcNode = AudioPlayer.audioCtx.createMediaElementSource(AudioPlayer.audioElement)
const destNode = AudioPlayer.audioCtx.createMediaStreamDestination()

initProcessor(AudioPlayer.audioCtx, srcNode, destNode)
initAncProcessor(AudioPlayer.audioCtx, destNode)
initOutputAudio(destNode.stream)

const globalPlayer = new AudioPlayer()
window.globalPlayer = globalPlayer

navigator.mediaSession.setActionHandler('play', () => globalPlayer.play())
navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause())
hooks.on('player:play', () => globalPlayer.play())
hooks.on('player:pause', () => globalPlayer.pause())