const { invoke } = require('../main/invoker')

async function createThread(name) {
    return await invoke('threads:create', name)
}

async function killThread(name) {
    return await invoke('threads:kill', name)
}

module.exports = {
    createThread,
    killThread,
}