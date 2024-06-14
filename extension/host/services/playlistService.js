const initInvokerService = require('../../../utils/main-invoker/node')
const { server } = require('../../../utils/ipc/net')
const { json } = require('../../../utils/ipc/utils')

module.exports = function (bw) {
    const invoker = initInvokerService(bw)
    const proxy = new Proxy({
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

    server('playlist', s => {
        s.on('data', async d => {
            const v = await proxy['playlist' + d.toString('utf-8')]()

            s.write(json(v))
        })
    })

    return proxy
}