import {EventEmitter} from './events.js'
export const rem = new EventEmitter({captureRejections: true})

rem.on('error', err => {
    console.error(err);
})

export class LifeCycle {

    static _lifeCycle = new EventEmitter({captureRejections: true})
        .on('error', msg => console.error(msg))

    static states = {
        uninit: 0,

        //init
        runtimeReady: 1,
        playerReady: 2,
        controlsReady: 3,

        started: 4,

        0: 'uninit',
        1: 'runtimeReady',
        2: 'playerReady',
        3: 'controlsReady',
        4: 'started',
    }

    static _currentState = LifeCycle.states.uninit

    /**
     * @param {keyof LifeCycle.states} state
     */
    static when = (state) => {
        const stateStr = state
        state = this.states[state]
        if (typeof state === 'undefined') {
            throw '[LifeCycle::when]: Unknown state'
        }

        if (state < this._currentState) {
            throw `[LifeCycle::when] when ${stateStr} but now is ${this.states[this._currentState]}`
        }

        return new Promise((resolve) => {
            this._lifeCycle.once(stateStr, () => {
                resolve()

                requestIdleCallback(() => {
                    if (!this._lifeCycle.listenerCount(stateStr)) {
                        this.next()
                    }
                })

            })
        })
    }

    static start = () => {
        if (this._currentState !== this.states.uninit) {
            throw '[LifeCycle::start]'
        }

        this.next()
    }

    static next = () => {
        if (this._currentState > 4) {
            return
        }

        requestIdleCallback(() => {
            if (!this._lifeCycle.listenerCount(this.states[this._currentState])) {
                this.next()
            }

            this._lifeCycle.emitNone(this.states[
                this._currentState++
            ])

        })
    }

}

LifeCycle.when('controlsReady').then(() => {
    hooks.send('win:show-main')
})