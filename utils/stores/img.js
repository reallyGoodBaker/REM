import { LifeCycle } from "../rem";
import { store } from './base.js'

let storeLoaded = false

LifeCycle.when('uninit').then(() => storeLoaded = true)

export async function saveImg(url) {
    let index = await store.get('ThumbNails/index') || []

    const buf = await (await fetch(url)).arrayBuffer()
    store.setRaw(`ThumbNails/${index.length}`, buf.slice(0))

    index.push(url)
    store.set('ThumbNails/index', index)
}

export async function getImg(url) {
    let index = await store.get('ThumbNails/index') || []

    const uri = index.indexOf(url)

    if (!~uri) {
        return url
    }

    return store.getRaw(`ThumbNails/${uri}`)
}

const imgUriCache = new Map()
export async function getImgSrc(url) {
    if (!storeLoaded) {
        return url
    }

    let _cache
    if (_cache = imgUriCache.get(url)) {
        return _cache
    }

    let data = await getImg(url)

    if (typeof data === 'string') {
        saveImg(url)
        return data
    }

    const val = URL.createObjectURL(new Blob([data]))
    imgUriCache.set(url, val)

    return val
}

export class ImageStore {
    last = []
    onloads = []
    tasks = []

    registerOnload(url) {
        return new Promise(res => {
            this.onloads.push(() => res(url))
        })
    }

    /**
     * @param {string} url 
     * @returns {Promise<string>}
     */
    getUri(url) {
        if (this.last.includes(url)) {
            return this.tasks[this.last.indexOf(url)]
        }

        this.last.push(url)
        const returnVal = this.registerOnload(url)
        this.tasks.push(returnVal)

        requestIdleCallback(this.handleLastUrls)

        return returnVal
    }

    handleLastUrls() {

    }
}

export class ImageDecodeQueue {
    _queue = []
    _callbacks = []
    size
    visible = new WeakSet()

    isVisible(img) {
        return this.visible.has(img)
    }

    observer = new IntersectionObserver(entries => {
        entries.forEach(v => {
            if (v.isIntersecting) {
                this.visible.add(v.target)
            } else {
                this.visible.delete(v.target)
            }
        })
    })

    constructor(size = 4) {
        this.size = size
        requestIdleCallback(this.handleOnce)
    }

    add(img) {
        this._queue.push(img)
    }

    handleOnce = async () => {
        const imgs = await this._decodeQueue()
        const callbacks = this._callbacks.splice(0, this.size)

        imgs.forEach((img, i) => {
            callbacks[i].call(null, img)
        })

        requestIdleCallback(this.handleOnce)
    }

    async _decodeQueue() {
        return await Promise.all(this._queue.splice(0, this.size).map(img => img.decode()))
    }

    decode(img) {
        this.add(img)
        return new Promise(res => {
            this._callbacks.push(el => res(el))
        })
    }

    observe(img) {
        this.observer.observe(img)
    }

    unobserve(img) {
        this.observer.unobserve(img)
    }
}

export const imageDecodeQueue = new ImageDecodeQueue()