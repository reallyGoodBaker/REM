import {Observable} from '../observable.js'

export class MetaData extends Observable {

    /**
     * @private
     */
    _metadata = {}

    constructor(init={}) {
        super()
        this.setMetadata(init)
    }

    /**
     * @param {MediaMetadata} data 
     */
    setMetadata(data={}) {
        this._metadata.title = data.title || this._metadata.title
        this._metadata.album = data.album || this._metadata.album
        this._metadata.artist = data.artist || this._metadata.artist
        this._metadata.artwork = data.artwork || this._metadata.artwork
    }

    getMetadataConfig() {
        return this._metadata
    }

    title(v) {
        if(typeof v !== 'undefined') {
            this._metadata.title = v
            return this
        }
        return this._metadata.title
    }

    album(v) {
        if(typeof v === 'undefined') {
            return this._metadata.album
        }
        this._metadata.album = v
        return this
    }

    artist(v) {
        if(typeof v === 'undefined') return this._metadata.artist
        this._metadata.artist = v
        return this
    }

    /**
     * @param {number} index 
     * @param {MediaImage} v 
     * @returns {this}
     */
    artwork(index, v) {
        if (typeof index === 'undefined') {
            return this._metadata.artwork || []
        }

        if (!this._metadata.artwork) this._metadata.artwork = []

        if(typeof v === 'undefined') return this._metadata.artwork[index]
        this._metadata.artwork[index] = v
        return this
    }

    setArtwork(array) {
        this._metadata.artwork = array
        return this
    }

    apply() {
        navigator.mediaSession.metadata = new MediaMetadata(this._metadata)
    }
}

export const globalMetadata = new MetaData()

/**
 * @param {string} title 
 * @param {string} album 
 * @param {string} artist 
 * @param {Array<MediaImage>} artwork 
 * @returns 
 */
 export function mediaMetadata(title, album, artist, artwork) {
    return new MetaData({title, album, artist, artwork})
}