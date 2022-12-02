const {invoke} = require('../main/invoker')

class BackgroundPlayerController {
    async play() {
        await invoke('player:play')
    }

    async pause() {
        await invoke('player:pause')
    }

    async next() {
        await invoke('player:next')
    }

    async previous() {
        await invoke('player:previous')
    }
}

module.exports = new BackgroundPlayerController()