/**@type {GainNode}*/
let gain
    ,/**@type {AudioContext}*/context
    ,destination

/**
 * @param {AudioContext} ctx 
 * @param {AudioDestinationNode} destNode 
 */
export async function initAncProcessor(ctx, destNode) {
    try {
        destination = destNode
        context = ctx
        gain = ctx.createGain()
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        const source = ctx.createMediaStreamSource(stream)

        source.connect(gain)
        
        enableAnc(false)

        return true
    } finally {
        return false
    }
}

export function enableAnc(bool = false) {
    if (bool) {
        gain.connect(destination)
    } else {
        gain.disconnect()
    }
}

export function setAncGain(val) {
    if (!gain) {
        return
    }

    gain.gain.linearRampToValueAtTime(-val, context.currentTime + 0.1)
}

export function getAncGain() {
    if (!gain) {
        return 1
    }

    return -gain.gain.value
}