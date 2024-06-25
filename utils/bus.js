const { EventEmitter } = require('events')

const bus = new EventEmitter()
bus.setMaxListeners(Infinity)

module.exports = bus