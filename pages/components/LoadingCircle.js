export class LoadingCircle extends HTMLElement {
    canvas
    ctx
    min = 60
    max = 270
    transformDuration = 500
    transformationDelay = 500
    angularVelocity = 0.2

    initCanvas() {
        this.ctx.scale(devicePixelRatio, devicePixelRatio)
        this.roundCap = true
        this.lineWidth = 6
        this.strokeStyle = document.body.style.getPropertyValue('--controlColor') || '#000'
    }

    get size() {
        if (!this.canvas) {
            return 200
        }

        return this.canvas.getBoundingClientRect().width
    }
    set size(v) {
        const c = this.canvas
        c.style.width = v + 'px'
        c.style.height = v + 'px'
        c.width = c.height = v * devicePixelRatio
        this.initCanvas()
    }
    get roundCap() {
        return this.ctx.lineCap == 'round'
    }
    set roundCap(v) {
        this.ctx.lineCap = v? 'round': 'butt'
    }
    get lineWidth() {
        return this.ctx.lineWidth
    }
    set lineWidth(v) {
        this.ctx.lineWidth = v
    }
    get strokeStyle() {
        return this.ctx.strokeStyle
    }
    set strokeStyle(v) {
        this.ctx.strokeStyle = v
    }

    ratio = window.devicePixelRatio
    csize = this.ratio * this.size

    start = 0
    end = this.min

    constructor() {
        super()

        const shadow = this.attachShadow({mode: 'open'})

        shadow.innerHTML = `<canvas id="canvas"></canvas>`
        this.canvas = shadow.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.size = 200
        this.roundCap = true
        this.lineWidth = 6
        this.strokeStyle = document.body.style.getPropertyValue('--controlColor') || '#000'

    }
    
    _a = Math.PI / 180
    render() {
        this.radStart = this.start * this._a
        this.radEnd = this.end * this._a
    }

    add = (n, dn) => {
        return (n + dn) % 360
    }

    circle = (() => {
        let counter = 0
        return dt => {
            counter += dt
            this.start = this.add(this.start, this.angularVelocity * dt)
            this.end = this.add(this.end, this.angularVelocity * dt)
            this.render()
            if (counter > this.transformationDelay) {
                this.state = this.state === 3? 0: this.state + 1
                return counter = 0
            }
        }
    })()

    stretch = (() => {
        let counter = 0
        let maxV = (this.max - this.min) / this.transformDuration
        let a = maxV / this.transformDuration
        let half = this.transformDuration / 2
        let v = () => {
            if (counter > half) {
                return maxV - (counter - half) * a
            }

            return counter * a
        }
        return dt => {
            counter += dt
            this.start = this.add(this.start, this.angularVelocity * dt)
            this.end = this.add(this.end, (2 * v() + this.angularVelocity) * dt)
            
            if (counter > this.transformDuration) {
                this.end = this.start + this.max
                this.state++
                this.render()
                return counter = 0
            }

            this.render()
        }
    })()

    shrink = (() => {
        let counter = 0
        let maxV = (this.max - this.min) / this.transformDuration
        let a = maxV / this.transformDuration
        let half = this.transformDuration / 2
        let v = () => {
            if (counter > half) {
                return maxV - (counter - half) * a
            }

            return counter * a
        }
        return dt => {
            counter += dt
            this.start = this.add(this.start, (2*v() + this.angularVelocity) * dt)
            this.end = this.add(this.end, this.angularVelocity * dt)
            
            if (counter > this.transformDuration) {
                this.start = this.end - this.min
                this.state++
                this.render()
                return counter = 0
            }

            this.render()
        }
    })()

    state = 0
    f = dt => {
        if (this.state == 0) {
            this.stretch(dt)
        }

        if (this.state == 1) {
            this.circle(dt)
        }

        if (this.state == 2) {
            this.shrink(dt)
        }

        if (this.state == 3) {
            this.circle(dt)
        }
    }

    radStart = 0
    radEnd = 0

    timeStamp
    drawOneFrame = timestamp => {
        if (!this.timeStamp) {
            this.timeStamp = timestamp
            requestAnimationFrame(this.drawOneFrame)
            return
        }

        const dt = timestamp - this.timeStamp
        this.timeStamp = timestamp

        this.f(dt)

        this.ctx.strokeStyle = this.strokeStyle
        this.ctx.clearRect(0, 0, this.size, this.size)
        this.ctx.beginPath()
        this.ctx.arc(this.size/2, this.size/2, (this.size - this.lineWidth) / 2, this.radStart, this.radEnd)
        this.ctx.stroke()
        this.ctx.closePath()
        requestAnimationFrame(this.drawOneFrame)
    }

    watchedAttrs = [
        'size', 'min', 'max', 'transformDuration', 'transformationDelay',
        'angularVelocity', 'roundCap', 'lineWidth', 'strokeStyle',
    ]

    connectedCallback() {
        this.watchedAttrs.map(v => this.initAttr(v))
        requestAnimationFrame(this.drawOneFrame)
    }

    initAttr(name) {
        if (!this.hasAttribute(name)) {
            return null
        }

        const val = this.getAttribute(name)

        this[name] = isNaN(+val)
            ? val
            : +val
    }

    attributeChangedCallback(n, _, val) {
        if (n === 'size') {
            return
        }
    
        if (this.watchedAttrs.includes(n)) {
            this[n] = isNaN(+val)
                ? val
                : +val
        }
    }
    
}