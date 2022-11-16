import { LifeCycle } from "../rem";
import {store} from './base.js'

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

export async function getImgSrc(url) {
    if (!storeLoaded) {
        return url
    }

    let data = await getImg(url)

    if (typeof data === 'string') {
        saveImg(url)
        return data
    }

    return URL.createObjectURL(new Blob([data]))
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