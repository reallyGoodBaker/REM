import {AudioData} from './audiodata.js'
import {globalPlayer} from './player.js'

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
    static loadList(list) {
        this.listData = list.concat([])
        this.current = 0
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
            __emitter.emit('loadedContent')
        })

        __emitter.emit('setControlsContent', ad)
    }
}

window.MainPlaylist = MainPlaylist