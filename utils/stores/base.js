export const store = {
    async get(key) {
        let res = null,
            data = await hooks.invoke('store:get', key)
        
        try {
            res = JSON.parse(data);
        } catch (e) {
            res = data;
        }

        if (res !== undefined && res !== null) {
            return res
        }

        return undefined;

    },

    getSync(key) {
        let res = null,
            data = hooks.sendSync('store:getSync', key)
        
        try {
            res = JSON.parse(data);
        } catch (e) {
            res = data;
        }

        if (res !== undefined && res !== null) {
            return res
        }

        return undefined;
    },

    async getRaw(key) {
        let res = await hooks.invoke('store:getRaw', key)

        if (res !== undefined && res !== null) {
            return res
        }

        return undefined;
    },

    async set(key, val) {
        let data
        try {
            data = JSON.stringify(val)
        } catch (_) {
            data = val
        }

        return await hooks.invoke('store:set', key, data)
    },

    async setRaw(key, val) {
        return await hooks.invoke('store:set', key, val)
    },

    async rm(key) {
        return await hooks.invoke('store:rm', key)
    },

    async clear() {
        return await hooks.invoke('store:clear')
    }
}

const safeMethods = [ 'get', 'getRaw', 'getSync', 'set', 'setRaw', 'rm' ]

export const safeStore = constKey => {
    return new Proxy(store, {
        get(t, p) {
            if (!safeMethods.includes(p)) {
                return undefined
            }

            return (...args) => t[p].call(t, constKey, ...args)
        },

        set() { return false }
    })
}