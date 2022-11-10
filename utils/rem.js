import {EventEmitter} from './events.js'
export const rem = new EventEmitter({captureRejections: true})

rem.on('error', err => {
    console.error(err);
})