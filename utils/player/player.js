import {EventEmitter} from '../events.js'

export class AudioPlayer {

    static audioElement = document.createElement('audio')
    static em = new EventEmitter()

    static on(type, handler) {
        this.em.on(type, handler)
    }
    on(type, handler) {
        AudioPlayer.on(type, handler)
    }

    static play() {
        this.em.emit('play')

        hooks.send('thumbar:pause')

        return this.audioElement.play()
    }
    play() {
        return AudioPlayer.play()
    }

    static pause() {
        this.audioElement.pause()

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
        this.audioData = audioData
        this.load(await audioData.url())

        this.onDataLoaded()
    }

    onDataLoaded() {

    }

    static volume(number) {
        if(!number) return this.audioElement.volume
        this.audioElement.volume = number
    }
    volume(number) {
        return AudioPlayer.volume(number)
    }

    static duration() {
        return this.audioElement.duration
    }
    duration() {
        return AudioPlayer.duration()
    }

}

AudioPlayer.audioElement.addEventListener('ended', () => {
    AudioPlayer.em.emit('ended')
})

export const globalPlayer = new AudioPlayer()

window.Player = globalPlayer

navigator.mediaSession.setActionHandler('play', () => globalPlayer.play())
navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause())
hooks.on('player:play', () => globalPlayer.play())
hooks.on('player:pause', () => globalPlayer.pause())