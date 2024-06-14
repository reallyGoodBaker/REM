const { invoke } = require('../main/invoker')

async function openWindow(file, options) {
    return await invoke('win:open', file, options)
}

async function closeWindow(id) {
    return await invoke('win:close', id)
}

module.exports = {
    openWindow,
    closeWindow
}