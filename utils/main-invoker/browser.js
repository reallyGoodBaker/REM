const ipcInvoker = globalThis['[[@@invoker]]']

class InvokerServer {

    on(channel, listener) {
        ipcInvoker.on(channel, async (ev, { id, args }) => {
            let val, err = val = null

            if (!listener) {
                return ipcInvoker.send(channel, { val: null, err: 'Invalid channel.', id })
            }

            try {
                val = await listener.apply(null, args)
            } catch (er) {
                err = er
            }

            ipcInvoker.send(channel, { val, err, id })
        })
    }

}

export const invoker = new InvokerServer()