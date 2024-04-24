const { invoke } = require('../main/invoker')

class Store {
    async get(k) {
        return await invoke('get', k)
    }

    async getRaw(k) {
        return await invoke('getRaw', k)
    }

    async set(k, v) {
        return await invoke('set', k, v)
    }

    async rm(k) {
        return await invoke('rm', k)
    }
}

module.exports = new Store()