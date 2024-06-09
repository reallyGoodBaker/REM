const net = require('net')
const fs = require('fs')
const { jsonObj } = require('./utils')

const pipeName = ({
    win32: `\\\\?\\pipe\\rem\\`,
    linux: '/tmp/rem/',
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

class Socket {
    #socket = null

    constructor(socket) {
        this.#socket = socket
    }

    async close() {
        return new Promise(res => this.#socket.end(res))
    }

    /**
     * @param {string | Uint8Array} data
     * @returns 
     */
    async invoke(data) {
        const { promise, reject, resolve } = promiseResolvers()
        this.#socket
            .once('data', val => {
                resolve(jsonObj(val))
            })
            .once('error', reject)
            .write(data)
    
        return promise
    }
}

/**
 * @param {string} name 
 * @param {(socket: net.Socket) => void} listener
 */
function server(name, listener = s => s.write('ok')) {
    if (!fs.existsSync(pipeName) && process.platform !== 'win32') {
        fs.mkdirSync(pipeName)
    }

    unlink(name)
    net.createServer(listener)
        .listen(pipeName + name)
}

function unlink(name) {
    const pipe = pipeName + name
    if (fs.existsSync(pipe)) {
        fs.unlinkSync(pipe)
    }
}

/**
 * @param {string} name 
 */
function connect(name) {
    return new Socket(net.connect(pipeName + name))
}

/**
 * @param {string} type 
 * @param {(val: any) => void} [receiver] 
 */
function subscribe(type, receiver=Function.prototype) {
    const socket = net.connect(pipeName + 'subscribe')
    socket.write(type)
    socket.on('data', val => {
        const contents = val.toString().split('\0')
        const v = contents[contents.length - 2]
        const data = jsonObj(v)

        receiver(data)
    })

    return new Socket(socket)
}

module.exports = {
    server, connect, subscribe, unlink,
}