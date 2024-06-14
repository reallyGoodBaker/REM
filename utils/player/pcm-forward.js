import { rem } from '../../utils/rem.js'
import { store } from '../stores/base.js'

const bufferSize = 4096

/**
 * @param {AudioContext} ctx 
 * @param {AudioNode} node 
 * @param {AudioDestinationNode} dest 
 */
export async function initPcmForward(ctx, node, dest) {
    const forward = ctx.createScriptProcessor(bufferSize)
    const { pluginOutput } = store.getSync('AppSettings/output')

    forward.addEventListener('audioprocess', ({ inputBuffer: buf }) => {
        const c0 = buf.getChannelData(0)
        const c1 = buf.getChannelData(1)
        const halfLen = c0.length
        const len = halfLen << 1
        const buffer = new Float32Array(len)

        buffer.set(c0)
        buffer.set(c1, halfLen)

        hooks.send('pcm', buffer)
    })

    function setPluginOutput(bool) {
        if (bool) {
            node.disconnect()
            node.connect(forward)
            forward.connect(dest)
        } else {
            forward.disconnect()
            node.disconnect()
            node.connect(dest)
        }
    }

    setPluginOutput(pluginOutput)
    rem.on('setPluginOutput', setPluginOutput)
}