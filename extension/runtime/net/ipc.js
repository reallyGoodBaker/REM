const net = require('net')
const { promiseResolvers } = require('../../../utils/high-level/node/promise')
const pipeName = `\\\\?\\pipe\\rem\\`

let servers = new Map()

/**
 * @param {string} name 
 * @param {(socket: net.Socket) => void} listener 
 * @returns 
 */
function provide(name, listener = s => s.write('ok')) {
    let server
    if (server = servers.get(name)) {
        return server
    }

    return server = net
        .createServer(listener)
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
        .once('data', (...args) => {
            console.log(args)
            resolve()
        })
        .once('error', reject)
        .write(data)

    return promise
}

module.exports = {
    provide, connect, invoke,
}