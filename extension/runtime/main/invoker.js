const { parentPort, MessagePort } = require('worker_threads')
const { X509Certificate } = require('crypto')
const { Blob } = require('buffer')
const { EventEmitter } = require('stream')

const invokeCallbacks = new Map()
let invokeId = 0

const services = new Map()

function call(name, ...args) {
    parentPort.postMessage({ name, args }, getTransList(args))
}

function invoke(name, ...args) {
    const id = invokeId++
    parentPort.postMessage({ id, name, args }, getTransList(args))

    return new Promise((res, rej) => {
        const callback = (err, val) => {
            if (err) {
                return rej(err)
            }

            res(val)
        }

        invokeCallbacks.set(id, callback)
    })
}

parentPort.on('message', v => {
    if (typeof v.uid === 'undefined') {
        return _handleMainReturned(v)
    }

    _handleMainRequest(v)
})

function _handleMainReturned({ id, val, err }) {
    let handler = invokeCallbacks.get(id)

    if (typeof handler !== 'function') {
        return
    }

    handler.call(undefined, err, val)
}

async function _handleMainRequest({ uid, name, args }) {
    let handler
    if (typeof (handler = services.get(name)) === 'function') {
        let val, err = val = null
        try {
            val = await handler.apply(undefined, args)
        } catch (e) {
            err = e
        }

        parentPort.postMessage({ uid, val, err }, getTransList([val]))
        return
    }

    parentPort.postMessage({ uid, val: null, err: null })
}

function getTransList(list) {
    return list.filter(v => {
        return v instanceof ArrayBuffer
            || v instanceof MessagePort
            || v instanceof X509Certificate
            || v instanceof Blob
            || v instanceof EventEmitter && 'fd' in v
    })
}

async function provide(name, handler) {
    if (typeof handler === 'function') {
        services.set(name, handler)
    }
}

async function ready() {
    return await invoke('@@ready')
}

async function whenReady(cb) {
    if (await ready())
        cb.call(null)
    else
        provide('ready', cb)   
}

module.exports = {
    invoke, call, provide, ready, whenReady,
}