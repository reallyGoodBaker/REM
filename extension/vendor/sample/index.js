const {
    player, notification, playlist, provide
} = require('../../runtime')

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
        channel: 'mini-control',
        title: name,
        onCancel: sendNotif,
        controls: [ (await player.isPlaying()) ? pause : play, pre, next ]
    }

    notification.send(notifBody)
}

provide('playerReady', sendNotif)