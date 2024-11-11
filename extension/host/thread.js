const { Extensions } = require('../../utils/appPath/main')
const path = require('path')
const fs = require('fs')
const child_process = require('child_process')
const { MessageChannel, MessagePort } = require('worker_threads')

const threadMapping = new Map()

/**
 * @param {child_process.ChildProcess} child 
 * @param {MessagePort} port 
 */
function bindMessagePort(child, port) {
    child.on('message', (message) => {
        port.postMessage(message)
    })
    port.on('message', (message) => {
        child.send(message)
    })
}

function createThread(threadName, { folderName, threads }) {
    const pluginRoot = path.join(Extensions, folderName)
    const threadFile = path.join(pluginRoot, threads[threadName])

    if (!fs.existsSync(threadFile)) {
        return null
    }

    const child = child_process.fork(threadFile)
    const { port1, port2 } = new MessageChannel()
    bindMessagePort(child, port2)
    threadMapping.set(threadName, child)

    return port1
}

function killThread(threadName) {
    const child = threadMapping.get(threadName)
    if (child) {
        child.kill()
        threadMapping.delete(threadName)
    }
}

module.exports = {
    createThread,
    killThread,
}