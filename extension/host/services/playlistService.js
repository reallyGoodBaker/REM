const initInvokerService = require('../../../utils/main-invoker/node')
const { server } = require('../../../utils/ipc/net')
const { json } = require('../../../utils/ipc/utils')

let playlistService = null

module.exports = function (bw) {
    if (playlistService) return playlistService

    const invoker = initInvokerService(bw)
    const proxy = new Proxy({
        keys() {
            return [
                ':next', ':previous', ':play', ''
            ].map(v => 'playlist' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('playlist')) {
                return (...args) => invoker.invoke(p, ...args)
            }
        },
        set() { return false }
    })

    server('playlist', s => {
        s.on('data', async d => {
            try {
                const [action, rawArgs = ''] = d.toString('utf-8').split('|')
                const args = rawArgs
                    ? rawArgs.split(',').map(value => Number(value.trim()))
                    : []

                const v = await proxy['playlist' + action](...args)
                s.write(json(v))
            } catch (err) {
                s.write(json({ error: String(err) }))
            }
        })
    })

    return playlistService = proxy
}
