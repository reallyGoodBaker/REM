const net = require('net')
const fs = require('fs')
const { jsonObj } = require('./utils')

const pipeName = ({
    win32: `\\\\?\\pipe\\rem\\`,
    linux: '\0rem/',
})[process.platform]

function promiseResolvers() {
    let resolve, reject
    let promise = new Promise((res, rej) => {
        resolve = v => (res(v), resolve = reject = null)
        reject = e => (rej(e), resolve = reject = null)
    })

    return {
        /**@type {Promise<any>}*/
        promise,
        /**@type {(value: any) => void}*/
        resolve,
        /**@type {(reason?: any) => void}*/
        reject
    }
}

/**
 * @param {string} name 
 * @param {(socket: net.Socket) => void} listener
 */
function server(name, listener = s => s.write('ok')) {
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
    server, connect, invoke, subscribe,
}