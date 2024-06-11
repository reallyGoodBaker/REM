const initInvokerService = require('../../../utils/main-invoker/node')

module.exports = function (bw) {
    const invoker = initInvokerService(bw)
    const proxy = new Proxy({
        keys() {
            return [
                'pluginOutput', 'device',
            ].map(v => 'output?' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('output?')) {
                return () => invoker.invoke(p)
            }
        },
        set() { return false }
    })

    return proxy
}