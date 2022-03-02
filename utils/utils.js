export {EventEmitter} from './events.js';
import {EventEmitter} from './events.js';

export class AudioPlayer {

    static audioElement = null;
    /**
     * @param {HTMLMediaElement} audioElement 
     */
    static setPlayer = function(audioElement) {
        AudioPlayer.audioElement = audioElement;
        audioElement.onended = () => {
            AudioPlayer.em.emit('ended');
        }
    }

    static em = new EventEmitter();

    static on(type, handler) {
        this.em.on(type, handler);
    }

    on(type, handler) {
        AudioPlayer.on(type, handler)
    }

    static play() {
        this.em.emit('play');
        return this.audioElement.play();
    }

    play() {
        return AudioPlayer.play();
    }

    static pause() {
        this.audioElement.pause();
        this.em.emit('pause');
    }

    pause() {
        AudioPlayer.pause()
    }

    static seek(time) {
        if (typeof time === 'number') this.audioElement.currentTime = time;
        else return this.audioElement.currentTime;
        this.em.emit('seek');
    }

    seek(time) {
        return AudioPlayer.seek(time)
    }

    static load(source) {
        if (source) {
            this.audioElement.src = source;
        }
        return this.audioElement.src;
    }

    load(source) {
        return AudioPlayer.load(source)
    }

    async loadData(audioData) {
        this.audioData = audioData;
        this.load(await audioData.url());
        navigator.mediaSession.metadata = new MediaMetadata({
            title: audioData.title(),
            artist: audioData.artist().reduce((pre, cur) => [...pre, cur.name], []).join('; '),
            album: audioData.album().name,
            artwork:[{src: audioData.album().picUrl}]
        });
        
        this.onDataLoaded();
    }

    onDataLoaded() {

    }

    static volume(number) {
        if(!number) return this.audioElement.volume;
        this.audioElement.volume = number;
    }

    volume(number) {
        return AudioPlayer.volume(number);
    }

    static duration() {
        return this.audioElement.duration;
    }

    duration() {
        return AudioPlayer.duration();
    }

}

const internalPlayer = new AudioPlayer();


export class AudioData {
    constructor(data) {
        this.data = data;
    }

    urls = {}

    async getPlayUrlAsync(quality='high') {
        let br;
        
        try {
            br = quality === 'low'? this.data.l.br:
                quality === 'medium'? this.data.m.br: this.data.h.br;
        } catch (error) {
            switch (quality) {
                case 'low': 
                    br = this.data.h? this.data.h.br: false;
                    if(br) break;
                case 'high':
                    br = this.data.m? this.data.m.br: false;
                    if(br) break;
                case 'medium': 
                    br = this.data.l? this.data.l.br: false;
                    if(br) break;
            }
        }


        const res = this.urls[quality] = await NeteaseApi.getSongUrl(this.data.id, store.get('cookie'), br);

        return res.body.data[0].url;
    }

    async url(quality='high') {
        if (this.urls[quality]) return this.urls[quality];
        return this.getPlayUrlAsync(quality);
    }

    title() {
        return this.data.name;
    }

    album() {
        return this.data.al;
    }

    artist() {
        return this.data.ar;
    }

}


class MainPlaylist {
    static listData = [];

    static getAudioData(index) {
        return new AudioData(this.listData[index]);
    }

    static current = 0;

    static mode = 0;
    static MODE = 0;
    static MODE_SINGLE_LOOP = 1;
    static MODE_RANDOM = 2;

    /**
     * @param {Array} list 
     */
    static loadList(list) {
        this.listData = list.concat([]);
        this.current = 0;
    }
    
    static next() {
        let c = this.current, len = this.listData.length;

        switch (this.mode) {
            case 0:
                c = c === len - 1? 0: c+1;
                break;
            case 2:
                c = ~~(Math.random()*len-1);
                break;
            default:
                break;
        }

        this.current = c;
        
        return this.getAudioData(c);
    }

    static prev() {
        let c = this.current, len = this.listData.length;

        switch (this.mode) {
            case 0:
                c = !c? len: c-1;
                break;
            case 2:
                c = ~~(Math.random()*len-1);
                break;
            default:
                break;
        }

        this.current = c;
        
        return this.getAudioData(c);
    }

    static playNext() {
        const ad = MainPlaylist.next();
        if(!ad) return;
        this.playByAudioData(ad);
    }

    static playPrev() {
        const ad = MainPlaylist.prev();
        if(!ad) return;
        this.playByAudioData(ad);
    }

    static play(index) {
        this.current = index;
        const ad = this.getAudioData(index);
        this.playByAudioData(ad);
    }

    static playByAudioData(ad) {
        internalPlayer.loadData(ad)
        .then(async () => {
            await internalPlayer.play();
            __emitter.emit('loadedContent');
        });

        __emitter.emit('setControlsContent', ad);
    }
}

window.MainPlaylist = MainPlaylist;

//初始化AudioPlayer
(function() {
    navigator.mediaSession.setActionHandler('play', internalPlayer.play);
    navigator.mediaSession.setActionHandler('pause', internalPlayer.pause);
    navigator.mediaSession.setActionHandler('nexttrack', () => MainPlaylist.playNext());
    navigator.mediaSession.setActionHandler('previoustrack', () => MainPlaylist.playPrev());
})();

/**
 * @param {string} title 
 * @param {string} album 
 * @param {string} artist 
 * @param {Array<MediaImage>} artwork 
 * @returns 
 */
export function mediaMetadata(title, album, artist, artwork) {
    return new MediaMetadata({title, album, artist, artwork});
}

const symbol_observers = Symbol('[[Observers]]');
export class Observable {

    /**
     * @private
     */
    [symbol_observers] = new Set();

    addObserver(observer) {
        if (typeof observer === 'function' || typeof observer === 'object' && observer && typeof observer.update === 'function') {
            this[symbol_observers].add(observer);
        }
    }

    removeObserver(observer) {
        if (!observer)  return this.removeAllObservers();
        this[symbol_observers].delete(observer);
    }

    removeAllObservers() {
        this[symbol_observers] = new Set();
    }

    notifyObservers(...args) {
        for (const observer of this[symbol_observers]) {

            if (typeof observer === 'function') 
                observer.call(this, ...args);
            else
                observer.update(this, ...args);

        }
    }
}

export class IMetadata extends Observable {

    /**
     * @private
     */
    _metadata = {};

    constructor(init={}) {
        super();
        this.setMetadata(init);
    }

    /**
     * @param {MediaMetadata} data 
     */
    setMetadata(data={}) {
        this._metadata.title = data.title || this._metadata.title;
        this._metadata.album = data.album || this._metadata.album;
        this._metadata.artist = data.artist || this._metadata.artist;
        this._metadata.artwork = data.artwork || this._metadata.artwork;
    }

    getMetadataConfig() {
        return this._metadata;
    }

    title(v) {
        if(typeof v !== 'undefined') this._metadata.title = v;
        else return this._metadata.title;
    }

    album(v) {
        if(typeof v !== 'undefined') this._metadata.album = v;
        else return this._metadata.album;
    }

    artist(v) {
        if(typeof v !== 'undefined') this._metadata.artist = v;
        else return this._metadata.artist;
    }

    /**
     * @param {number} index 
     * @param {MediaImage} v 
     * @returns 
     */
    artwork(index, v) {
        if (typeof index === 'undefined') {
            return this._metadata.artwork || [];
        }

        if (!this._metadata.artwork) {
            this._metadata.artwork = [];
        }

        if(typeof v !== 'undefined') this._metadata.artwork[index] = v;
        else return this._metadata.artwork[index];
    }

    setArtwork(array) {
        this._metadata.artwork = array;
    }

    apply() {
        navigator.mediaSession.metadata = new MediaMetadata(this._metadata);
    }
}

export const globalMetadata = new IMetadata();