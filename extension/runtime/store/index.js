const { invoke } = require('../main/invoker')

class Store {
    constructor(prefix='store.') {
        this.prefix = prefix
    }

    async get(k) {
        return await invoke(this.prefix + 'get', k)
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
    store: new Store(),
    settings: new Store('$store.'),
}