module.exports = {
    audio_player: require('./services/playerController'),
    playlist: require('./services/playlistService'),
    notification: require('../../utils/notification/main'),
    store: require('./services/store-provider'),
    output: require('./services/output-provider'),
}