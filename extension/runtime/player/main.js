const { invoke } = require('../main/invoker')

class BackgroundPlayerController {
    async play() {
        await invoke('player:play')
    }

    async pause() {
        await invoke('player:pause')
    }

    async isPlaying() {
        return await invoke('player.isPlaying')
    }

    async duration() {
        return await invoke('player.duration')
    }

    async seek(time) {
        return await invoke('player:seek', time)
    }

    async metadata() {
        return await invoke('player.metadata')
    }

    async audioData() {
        return await invoke('player.audioData')
    }
}

module.exports = new BackgroundPlayerController()