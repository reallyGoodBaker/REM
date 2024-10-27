import {EventEmitter} from '../events.js'
import {initAudioDevicesFind} from '../devices/browser/find.js'
import {initOutputAudio} from '../devices/browser/output.js'
import {fadeBeforePause, fadeBeforePlay, initProcessor} from './process.js'
import {initAncProcessor} from './anc.js'
import {LifeCycle, rem} from '../rem.js'
import { invoker } from '../main-invoker/browser.js'
import { UrlPlayerAdapter } from './url-player-adapter.js'
import { BufferPlayerAdapter } from './buffer-player-adapter.js'
import { initPcmForward } from './pcm-forward.js'
import { store } from '../stores/base.js'

initAudioDevicesFind()

export class AudioPlayer {

    static sampleRate = store.getSync('AppSettings/output')?.sampleRate
    static bufferMode = false
    static audioCtx = new AudioContext({ sampleRate: this.sampleRate === 0 ? undefined : this.sampleRate })
    static urlPlayer = new UrlPlayerAdapter(this.audioCtx)
    static bufferPlayer = new BufferPlayerAdapter(this.audioCtx)
    static audioElementSource = this.urlPlayer.outputNode()
    static audioBufferSource = this.bufferPlayer.outputNode()
    static virtualRoot = this.audioCtx.createGain()
    static em = new EventEmitter()


    static on(type, handler) {
        this.em.on(type, handler)
    }
    on(type, handler) {
        AudioPlayer.on(type, handler)
    }

    static isPlayingIgnoreFade = false

    static getAdapter() {
        return this.bufferMode ? this.bufferPlayer : this.urlPlayer
    }

    static async play() {
        const adapter = this.getAdapter()
        await adapter.play()
        
        hooks.send('thumbar:pause')
        this.em.emit('play')

        await fadeBeforePlay()
    }
    play() {
        return AudioPlayer.play()
    }

    static async pause() {
        if (await this.load()) {
            hooks.send('thumbar:play')
            this.em.emit('pause')
        }

        await fadeBeforePause()
        const adapter = this.getAdapter()
        adapter.pause()
    }
    pause() {
        AudioPlayer.pause()
    }

    static seek(time) {
        const adapter = this.getAdapter()
        if (typeof time === 'number') {
            adapter.seek(time)
        }
        else return adapter.currentTime()
        this.em.emit('seek')
    }
    seek(time) {
        return AudioPlayer.seek(time)
    }

    static switchTo(bufferMode=false) {
        if (bufferMode) {
            this.urlPlayer.stop()
            this.audioBufferSource.connect(this.virtualRoot)
        } else {
            this.bufferPlayer.stop()
            this.audioElementSource.connect(this.virtualRoot)
        }

        this.bufferMode = bufferMode
    }

    /**
     * @param {string|Uint8Array} [source] 
     * @returns 
     */
    static async load(source) {
        const adapter = this.getAdapter()
        if (source === undefined) {
            return await adapter.load()
        }

        if (typeof source === 'string') {
            this.switchTo(false)
            this.urlPlayer.load(source)
            return true
        }

        if (source instanceof Uint8Array) {
            this.switchTo(true)
            await this.bufferPlayer.load(source)
            return true
        }

        return false
    }
    load(source) {
        return AudioPlayer.load(source)
    }

    static async loadData(audioData, onload=Function.prototype) {
        audioData.onLoadMetadata = metadata => {
            AudioPlayer.metadata = metadata
            const clonedMetadata = this.getMetadata()
            rem.emit('metadata', clonedMetadata)
            this.em.emit('metadata', clonedMetadata)
        }

        AudioPlayer.audioData = audioData
    
        await this.load(await audioData.url())
        onload.call(this)
    }
    loadData(audioData, onload) {
        AudioPlayer.loadData(audioData, onload)
    }

    static volume(number) {
        if (typeof number === 'undefined') return this.virtualRoot.gain.value

        if (typeof number === 'number') {
            this.virtualRoot.gain.value = number
            return
        }

    }
    volume(number) {
        return AudioPlayer.volume(number)
    }

    static duration() {
        return (this.audioData?.data.dt / 1000) || 0
    }
    duration() {
        return AudioPlayer.duration()
    }

    static isPlaying() {
        return this.bufferMode
            ? this.bufferPlayer.playing()
            : this.urlPlayer.playing()
    }
    isPlaying() {
        return AudioPlayer.isPlaying()
    }

    static metadata = {}
    static getMetadata() {
        return structuredClone(this.metadata)
    }
    getMetadata() {
        return AudioPlayer.getMetadata()
    }

}


LifeCycle.when('runtimeReady').then(() => {
    const srcNode = AudioPlayer.virtualRoot
    const destNode = AudioPlayer.audioCtx.createMediaStreamDestination()

    AudioPlayer.urlPlayer.onended =
    AudioPlayer.bufferPlayer.onended =
    () => {
        AudioPlayer.em.emit('ended')
    }
    
    // AudioPlayer.audioElement.onloadedmetadata = () => {
    //     rem.emit('setControlsContent', AudioPlayer.audioData)
    // }

    const globalPlayer = new AudioPlayer()

    const lastProcessNode = initProcessor(AudioPlayer.audioCtx, srcNode, destNode)
    initAncProcessor(AudioPlayer.audioCtx, destNode)
    initPcmForward(AudioPlayer.audioCtx, lastProcessNode, destNode)
    initOutputAudio(destNode.stream)

    AudioPlayer.on('play', () => AudioPlayer.isPlayingIgnoreFade = true)
    AudioPlayer.on('pause', () => AudioPlayer.isPlayingIgnoreFade = false)
    AudioPlayer.on('ended', () => AudioPlayer.isPlayingIgnoreFade = false)
    AudioPlayer.on('loadedContent', () => hooks.send('win:player', structuredClone(AudioPlayer.audioData?.data)))

    navigator.mediaSession.setActionHandler('play', () => globalPlayer.play())
    navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause())
    hooks.on('player:play', async () => await globalPlayer.play())
    hooks.on('player:pause', () => globalPlayer.pause())

    invoker.on('player:play', async () => await globalPlayer.play())
    invoker.on('player:pause', () => globalPlayer.pause())
    invoker.on('player.isPlaying', () => AudioPlayer.isPlayingIgnoreFade)
    invoker.on('player.duration', () => globalPlayer.duration())
    invoker.on('player:seek', t => globalPlayer.seek(t))
    invoker.on('player.metadata', () => globalPlayer.getMetadata())
    invoker.on('player.audioData', () => structuredClone(AudioPlayer.audioData?.data))
})
