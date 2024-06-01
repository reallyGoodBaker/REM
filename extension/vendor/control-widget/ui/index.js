import './jq.js'

const { ipcRenderer } = require('electron')
const player = connect('player-controller')
const playlist = connect('playlist')
const update = subscribe('playstate', ([ playing, p ]) => {
    $('.music_progress_line').css('width', `${p * 100}%`)
    $(".cover").css("animation-play-state", playing ? "running" : "paused")
    $("#playBtn")
        .removeClass(playing ? "fa-play" : "fa-pause")
        .addClass(playing ? "fa-pause" : "fa-play")
})
const playerUpdate = subscribe('player', render)

win.beforeClose = () => {
    player.destroy()
    update.destroy()
    playlist.destroy()
    playerUpdate.destroy()
}

render()

let duration = Infinity

;(async() => {
    if (process.platform === 'darwin' || process.platform === 'win32') {
        const { colorHue, dark } = await ipcRenderer.invoke('app?theme')
        if (dark) {
            $('body').addClass('dark')
        } else {
            $('body').removeClass('dark')
        }

        $('.music_progress_line').css('background-color', `hsl(${colorHue}, 90%, 80%)`)
    }
})()

$('.music_progress_bar').on('click', ev => {
    const seekTo = ev.offsetX / 360 * duration
    invoke(player, `:seek|${seekTo}`)
})

$("#randomBtn").on("click", function () {
    ipcRenderer.invoke('win:restore')
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
    duration = Number(await invoke(player, ".duration"))

    $(".name").text(name)
    $(".singer-album").text(ar.map(a => a.name).join(', ') + " - " + al.name)
    $(".time").text(duration)
    $("#img").attr("src", al.picUrl)
}