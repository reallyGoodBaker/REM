const { invoke } = require('../main/invoker')

class Store {
    constructor(prefix) {
        this.prefix = prefix
    }

    async get(k, defaultValue) {
        let value = await invoke(this.prefix + 'get', k)
        if (value !== undefined && value !== null) {
            return value
        }
        
        await this.set(k, defaultValue)
        return defaultValue
    }

    async getRaw(k) {
        return await invoke(this.prefix + 'getRaw', k)
    }

    async set(k, v) {
        return await invoke(this.prefix + 'set', k, v)
    }

    async rm(k) {
        return await invoke(this.prefix + 'rm', k)
    }
}

module.exports = {
    store: new Store('store.'),
    settings: new Store('$store.'),
}