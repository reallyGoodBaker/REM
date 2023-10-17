const {
    player, notification, playlist, interval, whenReady,
} = require('../../runtime')


const setup = () => {
    notification.send({
        title: '你好',
        message: 'Hello World'
    })
}

whenReady(setup)