export * from './maps.js'
import { EventEmitter } from "./events.js";

const connects = new EventEmitter({captureRejections: true})

/**
 * @typedef {(con: GameController) => void} GamepadChange
 */


/**
 * @param {GamepadChange} handler 
 */
function onConnect(handler) {
    connects.on('--connect', handler)
}

/**
 * @param {GamepadChange} handler 
 */
function onDisconnect(handler) {
    connects.on('--disconnect', handler)
}

export const gamepads = {
    onConnect, onDisconnect
}


class GameController extends EventEmitter {
    static controllers = []

    gamepad = null

    get id() {
        return this.gamepad.id
    }

    get mapping() {
        return this.gamepad.mapping
    }

    /**
     * @param {Gamepad} pad 
     */
    constructor(pad) {
        super({captureRejections: true})

        this.gamepad = pad

        GameController.controllers[pad.index] = this

        this.on('press', index => this.emit(`press-${index}`))
        this.on('release', index => this.emit(`release-${index}`))
        this.on('value', (index, val) => this.emit(`value-${index}`, val))
        this.on('axel', (index, val) => this.emit(`axel-${index}`, val))
    }

    vibrate(time, strongMagnitude=0, weakMagnitude=0) {
        let vibrator = null
        if(vibrator = this.gamepad.vibrationActuator) {
            vibrator.playEffect(vibrator.type, {
                duration: time,
                strongMagnitude, weakMagnitude
            })
        }
    }

    addPressListener(buttonIndex, handler) {
        this.on(`press-${buttonIndex}`, handler)
    }
    removePressListener(buttonIndex, handler) {
        this.off(`press-${buttonIndex}`, handler)
    }


    addReleaseListener(buttonIndex, handler) {
        this.on(`release-${buttonIndex}`, handler)
    }
    removeReleaseListener(buttonIndex, handler) {
        this.off(`release-${buttonIndex}`, handler)
    }


    addValueChangeListener(buttonIndex, handler) {
        this.on(`value-${buttonIndex}`, handler)
    }
    removeValueChangeListener(buttonIndex, handler) {
        this.off(`value-${buttonIndex}`, handler)
    }


    addAxelChangeListener(axelIndex, handler) {
        this.on(`axel-${axelIndex}`, handler)
    }
    removeAxelChangeListener(axelIndex, handler) {
        this.off(`axel-${axelIndex}`, handler)
    }


}



function arrayCompare(pre, cur, comparator, onHasDifference) {
    if (pre.length !== cur.length) {
        return
    }

    const len = pre.length

    for (let i = 0; i < len; i++) {
        let oldVal = pre[i],
            newVal = cur[i]

        if (!comparator(oldVal, newVal)) {
            onHasDifference.call(null, oldVal, newVal, i)
        }
    }
}


function init() {
    window.addEventListener('gamepadconnected', ev => {
        connects.emit('--connect', new GameController(ev.gamepad))
    })

    window.addEventListener('gamepaddisconnected', ev => {
        connects.emit('--disconnect', new GameController(ev.gamepad))
    })

    function update(handler) {
        requestAnimationFrame(() => {
            handler.apply(null)
            update(handler)
        })
    }

    let btns = [],
        axes = []


    update(() => {
        let i = 0
        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) {
                i++
                continue
            }

            if (btns[i]) {
                arrayCompare(btns[i], gamepad.buttons,
                    (oldVal, newVal) => {
                        if (
                            oldVal.pressed === newVal.pressed &&
                            oldVal.touched === newVal.touched &&
                            oldVal.value === newVal.value
                        ) {
                            return true
                        }
                    },
                    (oldVal, newVal, index) => {
                        connects.emit('button-change', oldVal, newVal, index, i)
                    }
                )
                
            }
            btns[i] = gamepad.buttons


            if (axes[i]) {
                arrayCompare(axes[i], gamepad.axes,
                    (oldVal, newVal) => {
                        return oldVal === newVal
                    },
                    (oldVal, newVal, index) => {
                        connects.emit('axes-change', oldVal, newVal, index, i)
                    }
                )
            }
            axes[i] = gamepad.axes

            i++
        }
    })

    connects.on('button-change', (oldVal, newVal, btnIndex, gamepad) => {
        const con = GameController.controllers[gamepad]
    
        con.emit('button-change', btnIndex, newVal, oldVal)
    
        if (newVal.pressed !== oldVal.pressed) {
            if (newVal.pressed) {
                con.emit('press', btnIndex)
            } else {
                con.emit('release', btnIndex)
                con.emit('value', btnIndex, 0)
            }
        } else {
            con.emit('value', btnIndex, newVal.value, oldVal.value)
        }
    
    })
    
    
    connects.on('axes-change', (oldVal, newVal, index, gamepad) => {
        const con = GameController.controllers[gamepad]
    
        con.emit('axel', index, newVal, oldVal);
    })

}

if (typeof navigator.getGamepads === 'function') {
    init()
} else {
    throw 'Your browser does not support the Gamepad API, please consider updating your browser'
}