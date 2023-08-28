const { invoke } = require("../main/invoker")

class BackgroundPlaylist {
    async next() {
        await invoke('playlist:next')
    }

    async previous() {
        await invoke('playlist:previous')
    }
}

module.exports = new BackgroundPlaylist()