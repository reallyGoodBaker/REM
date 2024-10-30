module.exports = ({ store }, _, { id }) => {
    const keys = [
        'store.get', 'store.getRaw', 'store.set', 'store.rm',
        '$store.get', '$store.getRaw', '$store.set', '$store.rm'
    ]

    return new Proxy(store, {
        get(t, p) {
            if (p === 'keys') {
                return keys
            }

            if (p.startsWith('store.')) {
                return t[p.slice(6)]
            }

            if (p.startsWith('$store.')) {
                return (...args) =>
                    t[p.slice(7)](`ExtensionSettings/${id}`, ...args)
            }
        },
        set() { return false }
    })
}