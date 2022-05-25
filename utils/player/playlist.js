import {AudioData} from './audiodata.js'
import {globalPlayer} from './player.js'

/**
 * @param {string[]} raw 
 * @param {string} search 
 * @returns 
 */
function searchStrArr(raw, search) {
    return raw.filter(str => str.includes(search))
}

export class MainPlaylist {
    static listData = []
    static getAudioData(index) {
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
    static loadList(list=[]) {
        this.listData = list.concat([])
        this.current = 0
    }

    /**
     * @param {{name?: string; ar?: string[]; al?: string}} config 
     * @returns {number[]}
     */
    static query(config) {
        let matched = []

        this.listData.forEach((el, i) => {
            if (config.name) {
                if (el.name.includes(config.name)) {
                    matched.push(i)
                }
            }
        })

        return matched

    }
    
    static next() {
        let c = this.current, len = this.listData.length

        switch (this.mode) {
            case 0:
                c = c === len - 1? 0: c+1
                break
            case 2:
                c = ~~(Math.random()*len-1)
                break
            default:
                break
        }

        this.current = c
        
        return this.getAudioData(c)
    }

    static prev() {
        let c = this.current, len = this.listData.length

        switch (this.mode) {
            case 0:
                c = !c? len: c-1
                break
            case 2:
                c = ~~(Math.random()*len-1)
                break
            default:
                break
        }

        this.current = c
        
        return this.getAudioData(c)
    }

    static playNext() {
        const ad = MainPlaylist.next()
        if(!ad) return
        this.playByAudioData(ad)
    }

    static playPrev() {
        const ad = MainPlaylist.prev()
        if(!ad) return
        this.playByAudioData(ad)
    }

    static play(index) {
        this.current = index
        const ad = this.getAudioData(index)
        this.playByAudioData(ad)
    }

    static playByAudioData(ad) {
        globalPlayer.loadData(ad)
        .then(async () => {
            await globalPlayer.play()
            rem.emit('loadedContent')
        })

        rem.emit('setControlsContent', ad)
    }
}

navigator.mediaSession.setActionHandler('nexttrack', () => MainPlaylist.playNext())
navigator.mediaSession.setActionHandler('previoustrack', () => MainPlaylist.playPrev())
hooks.on('player:previous', () => MainPlaylist.playPrev())
hooks.on('player:next', () => MainPlaylist.playNext())