const net = require('net')
const { promiseResolvers } = require('../high-level/node/promise')
const fs = require('fs')
const pipeName = `\\\\?\\pipe\\rem\\`
const { jsonObj } = require('./utils')

/**
 * @param {string} name 
 * @param {(socket: net.Socket) => void} listener
 */
function provide(name, listener = s => s.write('ok')) {
    if (fs.existsSync(pipeName + name)) {
        return
    }

    net.createServer(listener)
        .listen(pipeName + name)
}

/**
 * @param {string} name 
 */
function connect(name) {
    return net.connect(pipeName + name)
}

/**
 * 
 * @param {net.Socket} socket 
 * @param {string | Uint8Array} data
 */
async function invoke(socket, data) {
    const { promise, reject, resolve } = promiseResolvers()
    socket
        .once('data', val => {
            resolve(jsonObj(val))
        })
        .once('error', reject)
        .write(data)

    return promise
}

/**
 * @param {string} type 
 * @param {(val: any) => void} [receiver] 
 */
function subscribe(type, receiver=Function.prototype) {
    const socket = connect('subscribe')
    socket.write(type)
    socket.on('data', val => {
        const contents = val.toString().split('\0')
        const v = contents[contents.length - 2]
        const data = jsonObj(v)

        receiver(data)
    })

    return socket
}

module.exports = {
    provide, connect, invoke, subscribe,
}