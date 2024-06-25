const fs = require('fs')

class Configurator {

    store = {}

    constructor(path) {
        this.path = path
        this.sync()
    }

    sync = () => {
        try {
            this.store = JSON.parse(
                fs.readFileSync(this.path).toString()
            )
        } catch (_) { }
    }

    clone = () => {
        return Object.assign({}, this.store)
    }

    remove = key => {
        delete this.store[key]
    }

    assign = obj => {
        this.store = Object.assign(this.store, obj)
    }

    commit = () => {
        try {
            fs.writeFileSync(
                this.path,
                JSON.stringify(this.store)
            )
        } catch (_) { }
    }

}

function open(path) {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '{}')
    }

    const configurator = new Configurator(path)
    const accessibles = ['clone', 'assign', 'commit', 'store', 'sync', 'remove']

    return new Proxy(configurator, {
        set() { return false },
        get(t, p) {
            if (accessibles.includes(p)) {
                return t[p]
            }

            return t.store[p]
        }
    })
}

module.exports = {
    open, Configurator
}