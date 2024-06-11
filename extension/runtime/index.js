const { invoke, call, provide, ready, whenReady } = require('./main/invoker')
const { timeout, interval } = require('./main/schedule')
const player = require('./player/main')
const notification = require('./notification/main')
const playlist = require('./player/playlist')
const win = require('./win')
const ipc = require('./net/ipc')
const output = require('./player/output')

module.exports = {
    ready, invoke, call, provide, timeout, interval, player,
    notification, playlist, whenReady, win, ipc, output,
}