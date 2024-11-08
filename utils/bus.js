const { EventEmitter } = require('events')

const bus = new EventEmitter()
bus.setMaxListeners(0)

module.exports = bus