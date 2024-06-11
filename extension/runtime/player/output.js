const { invoke } = require('../main/invoker')

class Output {
    async device() {
        return await invoke('output?device')
    }

    async pluginOutput() {
        return await invoke('output?pluginOutput')
    }
}

module.exports = new Output()