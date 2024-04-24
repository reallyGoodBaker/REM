const {
    player, notification, playlist, interval, whenReady,
} = require('../../runtime/index')

const play = {
    icon: '\ue037',
    onClick() {
        player.play()
        sendNotif()
    }
}

const pause = {
    icon: '\ue034',
    onClick() {
        player.pause()
        sendNotif()
    }
}

const pre = {
    icon: '\ue045',
    onClick() {
        playlist.previous()
        sendNotif()
    }
}

const next = {
    icon: '\ue044',
    onClick() {
        playlist.next()
        sendNotif()
    }
}

const sendNotif = async () => {
    const { name } = (await player.audioData()) ?? { name: '' }
    const notifBody = {
        timeout: 600,
        channel: 'mini-control',
        title: name,
        message: `${Math.round(await player.seek())} / ${Math.round(await player.duration())}`,
        controls: [ (await player.isPlaying()) ? pause : play, pre, next ]
    }

    notification.send(notifBody)
}

const setup = () => {
    interval(() => {
        sendNotif()
    }, 500)
}

whenReady(setup)