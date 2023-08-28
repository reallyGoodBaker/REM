const initInvokerService = require('../../../utils/main-invoker/node')

module.exports = function (bw) {
    const invoker = initInvokerService(bw)

    return new Proxy({
        keys() {
            return [
                ':next', ':previous', ''
            ].map(v => 'playlist' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('playlist')) {
                return () => invoker.invoke(p)
            }
        },
        set() { return false }
    })
}