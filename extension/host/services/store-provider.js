const RemStore = require('../../../utils/stores/rem-store.js')

module.exports = function (_bw, _extension, manifest) {
    const store = new RemStore()
    const id = manifest?.id ?? ''

    const keys = [
        'store.get', 'store.getRaw', 'store.set', 'store.rm',
        '$store.get', '$store.getRaw', '$store.set', '$store.rm',
    ]

    return new Proxy(store, {
        get(t, p) {
            if (p === 'keys') {
                return keys
            }

            if (p.startsWith('store.')) {
                const method = p.slice(6)
                return (...args) => t[method](...args)
            }

            if (p.startsWith('$store.')) {
                const method = p.slice(7)
                return (...args) =>
                    t[method](`ExtensionSettings/${id}`, ...args)
            }
        },
        set() { return false },
    })
}
