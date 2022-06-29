/**
 * @typedef {import('../base/index').GameController} GameController
 */
import {gamepads, XboxKeys} from '../base/index.js'
import {mouseEventSimulator} from '../../event-simulate/mouseEventService.js'


class XboxControllerSupporter {

    scrollSpeed = 30
    cursorSpeed = 8
    stickDeadzone = 0.1

    virtCursor = /*{
        enable = false
        click: false,
        scroll: 0,
        x: visualViewport.width / 2,
        y: visualViewport.height / 2,
    }*/null

    transformSpeed = {
        x: 0,
        y: 0,
        scroll: 0
    }

    instance = false

    _isLooping = false

    _receiveMouseEvent = ev => {
        if (ev.isTrusted) {
            this._setVirtCursorEnable(false)
        }
    }

    _receiveControllerEvent = (_, val) => {
        if (Math.abs(val) > 0.1) {
            this._setVirtCursorEnable(true)
            if (!this._isLooping) {
                this._eachRenderTick()
            }
        }
    }

    _setVirtCursorEnable(bool=true) {
        if (bool) {
            this.virtCursor.enable = true
            mouseEventSimulator.setCursorVisible(false)
        } else {
            this.virtCursor.enable = false
            mouseEventSimulator.setCursorVisible(true)
        }
    }

    init(virtCursor) {
        if (!virtCursor) {
            return
        }

        this.virtCursor = virtCursor

        gamepads.onConnect(con => {
            if (this.instance) {
                return
            }

            if (!con.id.startsWith('Xbox')) {
                this._setVirtCursorEnable(false)
                return
            }

            this._setVirtCursorEnable(true)
            this.instance = con
            this._configController(con)
            window.addEventListener('mousemove', this._receiveMouseEvent)
            con.on('axel', this._receiveControllerEvent)
        })

        gamepads.onDisconnect(con => {
            this._setVirtCursorEnable(false)
            this.instance = null
            this._distroyInstance(con)
            window.removeEventListener('mousemove', this._receiveMouseEvent)
            con.off('axel', this._receiveControllerEvent)
        })
    }

    /**@param {GameController} con*/
    _configController = con => {
        con.vibrate(200, 1, 1)

        //con.on('press', this._onKeyDown)
        con.on('release', this._onKeyUp)
        con.addReleaseListener(XboxKeys.A, this.onEnsure)
        con.addReleaseListener(XboxKeys.B, this.onBack)
        con.addPressListener(XboxKeys.LB, this.onLeftButton)
        con.addPressListener(XboxKeys.RB, this.onRightButton)
        con.addAxelChangeListener(XboxKeys.AxelRightVertical, this.onScroll)
        con.addAxelChangeListener(XboxKeys.AxelLeftHorizontal, this.onCursorMoveHorizontal)
        con.addAxelChangeListener(XboxKeys.AxelLeftVertical, this.onCursorMoveVertical)

        this._eachRenderTick()
    }

    /**@param {GameController} con*/
    _distroyInstance(con) {
        //con.off('press', this._onKeyDown)
        con.off('release', this._onKeyUp)
        con.removeReleaseListener(XboxKeys.A, this.onEnsure)
        con.removeReleaseListener(XboxKeys.B, this.onBack)
        con.removePressListener(XboxKeys.LB, this.onLeftButton)
        con.removePressListener(XboxKeys.RB, this.onRightButton)
        con.removeAxelChangeListener(XboxKeys.AxelRightVertical, this.onScroll)
        con.removeAxelChangeListener(XboxKeys.AxelRightVertical, this.onCursorMoveHorizontal)
        con.removeAxelChangeListener(XboxKeys.AxelRightVertical, this.onCursorMoveVertical)
    }

    /**@private*/
    _onKeyDown = (x, y) => {
        this.virtCursor.click = true
        mouseEventSimulator.down(x, y)
    }
    /**@private*/
    _onKeyUp = () => {
        this.virtCursor.click = false
        const {x, y} = this.virtCursor
        mouseEventSimulator.up(x, y) 
    }

    onEnsure = () => {
        const {x, y} = this.virtCursor
        this.virtCursor.click = true
        mouseEventSimulator.click(x, y)
    }

    onBack = () => {
        Pager.removeByIndex(Pager.index())
    }

    onLeftButton = () => {
        let index = Pager.index()
        if (index) {
            Pager.select(index-1)
        } else {
            Pager.select(Pager.size()-1)
        }
    }

    onRightButton = () => {
        let index = Pager.index()
        if (index === Pager.size()-1) {
            Pager.select(0)
        } else {
            Pager.select(index+1)
        }
    }

    onScroll = val => {
        if(Math.abs(val) > this.stickDeadzone)
            this.transformSpeed.scroll = this.scrollSpeed * val
        else
            this.transformSpeed.scroll = 0
    }

    onCursorMoveHorizontal = val => {
        if(Math.abs(val) > this.stickDeadzone)
            this.transformSpeed.x = this.cursorSpeed * val
        else
            this.transformSpeed.x = 0
    }

    onCursorMoveVertical = val => {
        if(Math.abs(val) > this.stickDeadzone)
            this.transformSpeed.y = this.cursorSpeed * val
        else
            this.transformSpeed.y = 0
    }

    _eachRenderTick = () => {
        const {x, y} = this.virtCursor,
            vCursor = this.virtCursor,
            {x: dx, y: dy, scroll} = this.transformSpeed,
            {width, height} = visualViewport

        let _needMove = false

        const _x = x+dx,
            _y = y+dy

        if(dx && _x > 16 && _x < width-6) {
            vCursor.x = _x
            _needMove = true
        }
        if(dy && _y > 16 && _y < height-6) {
            vCursor.y = _y
            _needMove = true
        }

        if (_needMove) {
            mouseEventSimulator.move(_x, _y)
        }

        if (scroll) rem.emit('scroll-up', scroll)

        if (this.instance && this.virtCursor.enable) {
            this._isLooping = true
            requestAnimationFrame(() => {
                this._eachRenderTick()
            })
        } else {
            this._isLooping = false
        }
    }

}

export const xboxControllerMouseSupporter = new XboxControllerSupporter()
