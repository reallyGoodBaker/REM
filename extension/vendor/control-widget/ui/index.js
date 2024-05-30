import './jq.js'

const { ipcRenderer } = require('electron')
const player = connect('player-controller')
const playlist = connect('playlist')
const update = subscribe('playstate', ([ playing, progress ]) => {
    $(".music_progress_line").css("width", progress * 100 + "%")
    $(".cover").css("animation-play-state", playing ? "running" : "paused")
    $("#playBtn")
        .removeClass(playing ? "fa-play" : "fa-pause")
        .addClass(playing ? "fa-pause" : "fa-play")
})

win.beforeClose = () => {
    player.destroy()
    update.destroy()
    playlist.destroy()
}

render()

$("#randomBtn").on("click", function () {
    ipcRenderer.send('win:restore')
})

$("#playBtn").on("click", async function () {
    const playing = await invoke(player, ".isPlaying")
    await invoke(player, playing ? ':pause' : ':play')
    await render()
})

$("#prevBtn").on("click", async function () {
    await invoke(playlist, ":previous")
    await render()
})

$("#nextBtn").on("click", async function () {
    await invoke(playlist, ":next")
    await render()
})

async function render() {
    const {
        name,
        al,
        ar,
    } = await invoke(player, '.audioData')
    const duration = Number(await invoke(player, ".duration"))

    $(".name").text(name)
    $(".singer-album").text(ar.map(a => a.name).join(', ') + " - " + al.name)
    $(".time").text(duration)
    document.getElementById('img').src = al.picUrl
}