import App from './App.svelte';

let __storeCache = {};

const store = {
	get(key) {

		//缓存中有对象
		if (__storeCache[key]) {
			return __storeCache[key]
		}

		//缓存中没有对象, 拿到对象装进缓存
		let res = null, data = localStorage.getItem(key);
		try {
			res = JSON.parse(data);
		} catch (e) {
			res = data;
		}

		if (res !== undefined && res !== null) {
			return __storeCache[key] = res;
		}

		return undefined;
		
	},

	set(key, val) {
		__storeCache[key] = val;
		localStorage.setItem(key, typeof val === 'string'? val: JSON.stringify(val));
	},

	setCache(key, val) {
		__storeCache[key] = val;
	},

	rm(key) {
		if (__storeCache[key]) __storeCache[key] = null; 
		localStorage.removeItem(key);
	},

	has(key) {
		if (__storeCache[key]) {
			return true;
		}

		return !!this.get(key);
	},

    clear() {
        for (const k of Object.keys(__storeCache)) {
            this.rm(k)
        }
    }
}


import {EventEmitter} from '../utils/index.js'
window.store = store;
window.rem = new EventEmitter({captureRejections: true})
window.contextMap = new Map()


rem.isBeta = true


console.log(hooks);


export default new App({
	target: document.body
})