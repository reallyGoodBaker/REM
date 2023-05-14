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

    _callbacks = new WeakMap()
    _watched = new WeakSet()
    _queue = []
    _size
    _taskCount

    constructor(size=40, taskCount=10) {
        this._size = size
        this._taskCount = taskCount

        this._handleQueue()
    }

    _handleQueue = () => {
        const tasks = this._queue.splice(0, this._taskCount)

        for (const task of tasks) {
            task.call(null)
        }

        setTimeout(this._handleQueue)
    }

    observer = new IntersectionObserver(entries => {
        entries.forEach(v => {
            const callbacks = this._callbacks.get(v.target)

            if (!callbacks) {
                return
            }

            if (this._queue.length === this._size) {
                this._queue.shift()
            }

            if (v.isIntersecting) {
                this._watched.add(v.target)
                this._queue.push(callbacks.onVisible)
            } else {
                if (!this._watched.has(v.target)) {
                    return
                }
                this._watched.delete(v.target)
                callbacks.onInvisible()
            }
        })
    })

    watch(el, onVisible=Function.prototype, onInvisible=Function.prototype) {
        this._callbacks.set(el, {
            onVisible, onInvisible
        })
    }

    observe(el) {
        this.observer.observe(el)
    }

    unobserve(el) {
        this.observer.unobserve(el)
    }
}

export const imageDecodeQueue = new ImageDecodeQueue()

export const neteaseImgSizeParam = (h, w) => `?param=${h}y${w}`

export const NETEASE_IMG_SMALLER = neteaseImgSizeParam(20, 20)
export const NETEASE_IMG_SMALL = neteaseImgSizeParam(56, 56)
export const NETEASE_IMG_MEDIUM = neteaseImgSizeParam(96, 96)
export const NETEASE_IMG_LARGE = neteaseImgSizeParam(140, 140)
export const NETEASE_IMG_LARGER = neteaseImgSizeParam(200, 200)