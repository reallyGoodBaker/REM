import App from './App.svelte';

let __storeCache = new Map();

const store = {
    async get(key) {

        //缓存中有对象
        if (__storeCache.has(key)) {
            return __storeCache.get(key)
        }

        //缓存中没有对象, 拿到对象装进缓存
        let res = null,
            data = await hooks.invoke('store:get', key)
        
        try {
            res = JSON.parse(data);
        } catch (e) {
            res = data;
        }

        if (res !== undefined && res !== null) {
            return __storeCache.set(key, res), res
        }

        return undefined;

    },

    getSync(key) {
        if (__storeCache.has(key)) {
            return __storeCache.get(key)
        }

        let res = null,
            data = hooks.sendSync('store:getSync', key)
        
        try {
            res = JSON.parse(data);
        } catch (e) {
            res = data;
        }

        if (res !== undefined && res !== null) {
            return __storeCache.set(key, res), res
        }

        return undefined;
    },

    async set(key, val) {
        __storeCache.set(key, val)

        return await hooks.invoke('store:set', key, typeof val === 'string' ? val : JSON.stringify(val))
    },

    setCache(key, val) {
        __storeCache.set(key, val)
    },

    async rm(key) {
        if (__storeCache.has(key)) __storeCache.delete(key)

        return await hooks.invoke('store:rm', key)
    },

    clear() {
        for (const k of __storeCache.keys()) {
            this.rm(k)
        }
    }
}


import { EventEmitter } from '../utils/index.js'
import { initNetworkWatcher } from '../utils/network/browser.js'
window.store = store;
window.rem = new EventEmitter({ captureRejections: true })
window.contextMap = new Map()

rem.isBeta = true

initNetworkWatcher()

export default new App({
    target: document.body
})