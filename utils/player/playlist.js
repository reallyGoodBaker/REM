import { AudioData } from './audiodata.js'
import { LifeCycle, rem } from '../rem.js'
import { store } from '../stores/base.js'
import { AudioPlayer } from './player.js'
import { invoker } from '../main-invoker/browser.js'

/**
 * @param {string[]} raw 
 * @param {string} search 
 * @returns 
 */
export function searchStrArr(raw, search) {
    return raw.filter(str => str.includes(search))
}

export class MainPlaylist {
    static listData = []
    static getAudioData(index = this.current) {
        store.set('listElementPlaying', index)
        return new AudioData(this.listData[index])
    }

    static current = 0

    static mode = 0
    static MODE = 0
    static MODE_SINGLE_LOOP = 1
    static MODE_RANDOM = 2

    /**
     * @param {Array} list 
     */
    static loadList(list = []) {
        this.listData = list.slice()
        store.set('listPlaying', this.listData)
        this.current = 0
    }

    static getCurrentData() {
        return this.listData[this.current]
    }

    /**
     * @param {{name?: string; ar?: string[]; al?: string}} config 
     * @returns {number[]}
     */
    static query(config) {
        let result = this.listData

        if (config.name) {
            result = result.filter(({ name }) => name.includes(config.name))
        }

        // if (config.ar) {

        // }

        return result
    }

    static next() {
        if (!this.listData.length) {
            return
        }

        let c = this.current, len = this.listData.length

        switch (this.mode) {
            case 0:
                c = c === len - 1 ? 0 : c + 1
                break
            case 2:
                c = ~~(Math.random() * len - 1)
                break
            default:
                break
        }

        this.current = c

        return this.getAudioData(c)
    }

    static prev() {
        if (!this.listData.length) {
            return
        }

        let c = this.current, len = this.listData.length

        switch (this.mode) {
            case 0:
                c = !c ? len : c - 1
                break
            case 2:
                c = ~~(Math.random() * len - 1)
                break
            default:
                break
        }

        this.current = c

        return this.getAudioData(c)
    }

    static playNext() {
        const ad = MainPlaylist.next()
        if (!ad) return
        this.playByAudioData(ad)
    }

    static playPrev() {
        const ad = MainPlaylist.prev()
        if (!ad) return
        this.playByAudioData(ad)
    }

    static play(index = this.current) {
        this.current = index
        const ad = this.getAudioData(index)
        this.playByAudioData(ad)
    }

    static async load(index) {
        this.current = index
        const ad = this.getAudioData(index)
        await AudioPlayer.loadData(ad)
        rem.emit('loadedContent')
        rem.emit('setControlsContent', ad)
    }

    static playByAudioData(ad) {
        AudioPlayer.loadData(ad)
            .then(async () => {
                await AudioPlayer.play()
                rem.emit('loadedContent')
                AudioPlayer.em.emit('loadedContent')
            })

        rem.emit('setControlsContent', ad)
    }
}

LifeCycle.when('runtimeReady').then(() => {
    navigator.mediaSession.setActionHandler('nexttrack', () => MainPlaylist.playNext())
    navigator.mediaSession.setActionHandler('previoustrack', () => MainPlaylist.playPrev())
    hooks.on('player:previous', () => MainPlaylist.playPrev())
    hooks.on('player:next', () => MainPlaylist.playNext())
    invoker.on('playlist:previous', () => MainPlaylist.playPrev())
    invoker.on('playlist:next', () => MainPlaylist.playNext())
})