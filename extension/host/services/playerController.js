const initInvokerService = require('../../../utils/main-invoker/node')
const { server } = require('../../../utils/ipc/net')
const { json } = require('../../../utils/ipc/utils')

module.exports = function (bw) {
    const invoker = initInvokerService(bw)
    const proxy = new Proxy({
        keys() {
            return [
                ':play', ':pause', '.isPlaying', '.metadata', '.audioData',
                '.duration', ':seek',
            ].map(v => 'player' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('player')) {
                return (args=[]) => {
                    return invoker.invoke(p, ...args)
                }
            }
        },
        set() { return false }
    })

    server('player-controller', s => {
        const separator = /\|/
        s.on('data', async d => {
            const [ action, args ] = d.toString('utf-8').split(separator)
            const v = await proxy['player' + action](args?.split(',').map(v => Number(v.trim())))

            s.write(json(v))
        })
    })

    return proxy
}