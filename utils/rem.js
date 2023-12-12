import { EventEmitter } from './events.js'
export const rem = new EventEmitter({captureRejections: true, enableWatcher: true})

rem.on('error', err => {
    console.error(err);
})

const remEventWatcher = {
    emit({type, args}) {
        if (type === 'pageContentChange') {
            return
        }

        console.log('emit', type, ...args);
    },

    // add(arg) {
    //     console.log('add', arg);
    // }
}

// rem.connectWatcher(remEventWatcher)

export class LifeCycle {

    static _lifeCycle = new EventEmitter({captureRejections: true})
        .on('error', msg => console.error(msg))

    static states = {
        uninit: 0,

        //init
        runtimeReady: 1,
        playerReady: 2,
        controlsReady: 3,

        0: 'uninit',
        1: 'runtimeReady',
        2: 'playerReady',
        3: 'controlsReady',
    }

    static _currentState = LifeCycle.states.uninit

    /**
     * @param {keyof LifeCycle.states} state
     */
    static when = state => {
        const stateStr = state
        state = this.states[state]
        if (typeof state === 'undefined') {
            throw '[LifeCycle::when]: Unknown state'
        }

        if (state < this._currentState) {
            return new Promise(resolve => {
                this._lifeCycle.once(stateStr, resolve)
            })
        }

        return Promise.resolve()
    }

    /**
     * @param {keyof LifeCycle.states} state
     */
    static fire = state => {
        const stateStr = state
        state = this.states[state]

        if (typeof state === 'undefined') {
            throw '[LifeCycle::when]: Unknown state'
        }

        if (state < this._currentState) {
            throw `[LifeCycle::when] when ${stateStr} but now is ${this.states[this._currentState]}`
        }

        this._lifeCycle.emit(stateStr)
    }

}

// LifeCycle.when('controlsReady').then(() => {
//     hooks.send('win:show-main')
// })