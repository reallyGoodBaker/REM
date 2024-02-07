import { rem } from '../rem.js'
import { store } from '../stores/base.js'

let processConfig

let audioCtx

let delay
    , gain
    , fader
    , stereoPanner
    , dynamicsCompressor
    , connectNode

let eq31
    , eq62
    , eq125
    , eq250
    , eq500
    , eq1k
    , eq2k
    , eq4k
    , eq8k
    , eq16k
    , eq


/**
 * @param {AudioContext} ctx 
 */
function biquadFilterCreator(ctx) {
    /**
     * @param {'lowshelf'|'highshelf'|'peaking'} type
     * @param {number} f
     * @param {number} q
     */
    return function (type, f, q) {
        const bq = ctx.createBiquadFilter()
        bq.type = type
        bq.frequency.value = f
        bq.gain.value = 0

        if (q) {
            bq.Q.value = q
        }

        return bq
    }
}

/**
 * @param {AudioContext} ctx 
 */
function initAllEqualizers(ctx) {
    const bq = biquadFilterCreator(ctx)
    eq31 = bq('lowshelf', 31)
    eq62 = bq('peaking', 62, 1.516129)
    eq125 = bq('peaking', 125, 1.504)
    eq250 = bq('peaking', 250, 1.5)
    eq500 = bq('peaking', 500, 1.5)
    eq1k = bq('peaking', 1000, 1.5)
    eq2k = bq('peaking', 2000, 1.5)
    eq4k = bq('peaking', 4000, 1.5)
    eq8k = bq('peaking', 8000, 1.5)
    eq16k = bq('highshelf', 16000)

    eq31.connect(eq62)
    eq62.connect(eq125)
    eq125.connect(eq250)
    eq250.connect(eq500)
    eq500.connect(eq1k)
    eq1k.connect(eq2k)
    eq2k.connect(eq4k)
    eq4k.connect(eq8k)
    eq8k.connect(eq16k)

    eq = {
        31: eq31,
        62: eq62,
        125: eq125,
        250: eq250,
        500: eq500,
        1000: eq1k,
        2000: eq2k,
        4000: eq4k,
        8000: eq8k,
        16000: eq16k
    }
}

/**
 * @param {keyof eq} f 
 * @returns {typeof eq | number}
 */
export function getEq(f) {
    if (typeof f === 'undefined') {
        return Object.assign({}, processConfig.eq)
    }

    return processConfig.eq[f]
}

/**
 * @param {keyof eq} f 
 * @param {number} gain 
 */
export function setEq(f, gain) {
    processConfig.eq[f] = gain
    eq[f].gain.value = gain

    if (rem) {
        rem.emit('eqChange')
    }

    saveConfig()
}

export function setEqEnable(bool = true) {
    stereoPanner.disconnect()
    eq16k.disconnect()

    if (bool) {
        stereoPanner.connect(eq31)
        eq16k.connect(connectNode)
    } else {
        stereoPanner.connect(connectNode)
    }

    if (typeof rem !== 'undefined') {
        rem.emit('eqChange')
    }
}

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
    dynamicsCompressor = ctx.createDynamicsCompressor()
    connectNode = ctx.createGain()
    initAllEqualizers(ctx)

    srcNode.connect(gain)
    gain.connect(stereoPanner)
    stereoPanner.connect(connectNode)
    connectNode.connect(dynamicsCompressor)
    dynamicsCompressor.connect(delay)
    delay.connect(fader)
    fader.connect(destNode)

    initProcessorConfig()

    setEqEnable(processConfig.eq.enable)
    dynamicsCompressorEnable(processConfig.dynamicsCompressor)
}

function initProcessorConfig() {

    if (!(processConfig = store.getSync('process'))) {
        processConfig = {
            delay: { delayTime: 0.1 },
            gain: { gain: 1 },
            stereoPanner: { pan: 0 },
            fader: { fadeIn: 0.2, fadeOut: 0.2 },
            eq: {
                enable: true,
                31: 0,
                62: 0,
                125: 0,
                250: 0,
                500: 0,
                1000: 0,
                2000: 0,
                4000: 0,
                8000: 0,
                16000: 0
            },
            dynamicsCompressor: true,

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
        rem.emit('processUpdate', processConfig)
    }
}

export function setDelay(num) {
    delay.delayTime.value = num
    processConfig.delay.delayTime = num

    saveConfig()
}

export function getDelay() {
    return processConfig.delay.delayTime
}

export function setGain(num) {
    gain.gain.linearRampToValueAtTime(num, audioCtx.currentTime)
    processConfig.gain.gain = num

    saveConfig()
}

export function getGain() {
    return processConfig.gain.gain
}

export function setStereoPanner(num) {
    stereoPanner.pan.value = num
    processConfig.stereoPanner.pan = num

    saveConfig()
}

export function getStereoPan() {
    return processConfig.stereoPanner.pan
}

export function setFade(fadeIn = 0.2, fadeOut = 0.2) {
    processConfig.fader.fadeIn = fadeIn
    processConfig.fader.fadeOut = fadeOut

    saveConfig()
}

export function getFader() {
    return Object.assign({}, processConfig.fader)
}

export function dynamicsCompressorEnable(enable) {
    if (typeof enable === 'undefined') {
        return processConfig.dynamicsCompressor
    }

    if (processConfig.dynamicsCompressor === enable) {
        return
    }

    processConfig.dynamicsCompressor = enable
    saveConfig()

    connectNode.disconnect()
    dynamicsCompressor.disconnect()

    if (enable) {
        connectNode.connect(dynamicsCompressor)
        dynamicsCompressor.connect(delay)
        return
    }

    connectNode.connect(delay)
}