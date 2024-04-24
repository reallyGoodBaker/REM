const initInvokerService = require('../../../utils/main-invoker/node')

module.exports = function (bw) {
    const invoker = initInvokerService(bw)

    return new Proxy({
        keys() {
            return [
                ':play', ':pause', '.isPlaying', '.metadata', '.audioData',
                '.duration', ':seek'
            ].map(v => 'player' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('player')) {
                return () => invoker.invoke(p)
            }
        },
        set() { return false }
    })
}