import {EventEmitter} from '../events.js'
import {initAudioDevicesFind} from '../devices/browser/find.js'
import {initOutputAudio} from '../devices/browser/output.js'
import {fadeBeforePause, fadeBeforePlay, initProcessor} from './process.js'
import {initAncProcessor} from './anc.js'
import {LifeCycle, rem} from '../rem.js'

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
        await this.audioElement.play(),
        hooks.send('thumbar:pause')
        this.em.emit('play')

        await fadeBeforePlay()
    }
    play() {
        return AudioPlayer.play()
    }

    static async pause() {
        if (this.load()) {
            hooks.send('thumbar:play')
            this.em.emit('pause')
        }

        await fadeBeforePause()
        this.audioElement.pause()
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

    static async loadData(audioData, onload=Function.prototype) {
        audioData.onLoadMetadata = metadata => {
            AudioPlayer.metadata = metadata
            rem.emit('metadata', metadata)
        }

        AudioPlayer.audioData = audioData
    
        this.load(await audioData.url())
        onload.call(this)
    }
    loadData(audioData, onload) {
        AudioPlayer.loadData(audioData, onload)
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
    static getMetadata() {
        return Object.assign({}, this.metadata)
    }
    getMetadata() {
        return AudioPlayer.getMetadata()
    }

}


LifeCycle.when('runtimeReady').then(() => {
    const srcNode = AudioPlayer.audioCtx.createMediaElementSource(AudioPlayer.audioElement)
    const destNode = AudioPlayer.audioCtx.createMediaStreamDestination()

    AudioPlayer.audioElement.addEventListener('ended', () => {
        AudioPlayer.em.emit('ended')
    })
    
    AudioPlayer.audioElement.onloadedmetadata = () => {
        rem.emit('setControlsContent', AudioPlayer.audioData)
    }

    const globalPlayer = new AudioPlayer()

    initProcessor(AudioPlayer.audioCtx, srcNode, destNode)
    initAncProcessor(AudioPlayer.audioCtx, destNode)
    initOutputAudio(destNode.stream)

    navigator.mediaSession.setActionHandler('play', () => globalPlayer.play())
    navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause())
    hooks.on('player:play', () => globalPlayer.play())
    hooks.on('player:pause', () => globalPlayer.pause())
})
