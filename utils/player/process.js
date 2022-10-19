let processConfig

let audioCtx

let delay
    ,gain
    ,fader
    ,stereoPanner

/**
 * 
 * @param {AudioContext} ctx 
 * @param {MediaElementAudioSourceNode} srcNode 
 * @param {AudioDestinationNode} destNode 
 */
export function initProcessor(ctx, srcNode, destNode) {
    audioCtx = ctx
    delay = ctx.createDelay()
    gain = ctx.createGain()
    fader = ctx.createGain()
    stereoPanner = ctx.createStereoPanner()

    srcNode.connect(gain)
    gain.connect(stereoPanner)
    stereoPanner.connect(delay)
    delay.connect(fader)
    fader.connect(destNode)
}

export function initProcessorConfig() {

    if (!(processConfig = store.getSync('process'))) {
        processConfig = {
            delay: {delayTime: 0.1},
            gain: {gain: 1},
            stereoPanner: {pan: 0},
            fader: {fadeIn: 0.2, fadeOut: 0.2},
        }

        saveConfig()
    }

    delay.delayTime.value = processConfig.delay.delayTime
    gain.gain.linearRampToValueAtTime(processConfig.gain.gain, audioCtx.currentTime)
    stereoPanner.pan.value = processConfig.stereoPanner.pan
}

export function fadeBeforePause() {
    const delay = processConfig.delay.delayTime
    const fadeOut = processConfig.fader.fadeOut
    fader.gain.setValueAtTime(1, audioCtx.currentTime + delay)
    fader.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + fadeOut + delay)

    return new Promise(res => {
        setTimeout(() => {
            res()
        }, (delay + fadeOut) * 1000)
    })
}

export function fadeBeforePlay() {
    const delay = processConfig.delay.delayTime
    const fadeIn = processConfig.fader.fadeIn
    fader.gain.setValueAtTime(0.001, audioCtx.currentTime + delay)
    fader.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + fadeIn + delay)

    return new Promise(res => {
        setTimeout(() => {
            res()
        }, (delay + fadeIn) * 1000)
    })
}

function saveConfig() {
    store.set('process', processConfig)

    if (rem) {
        rem.emit('processUpdate')
    }
}

export function setDelay(num) {
    delay.delayTime.value = num
    processConfig.delay.delayTime = num

    saveConfig()
}

export function setGain(num) {
    gain.gain.linearRampToValueAtTime(num, audioCtx.currentTime)
    processConfig.gain.gain = num

    saveConfig()
}

export function setStereoPanner(num) {
    stereoPanner.pan.value = num
    processConfig.stereoPanner.pan = num

    saveConfig()
}

export function setFade(fadeIn=0.2, fadeOut=0.2) {
    processConfig.fader.fadeIn = fadeIn
    processConfig.fader.fadeOut = fadeOut

    saveConfig()
}