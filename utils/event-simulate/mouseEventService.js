class MouseEventSimulator {
    target = null

    click(x, y, button=0) {
        let ev = new PointerEvent('click', {
            clientX: x,
            clientY: y,   
            button,
            bubbles: true,
            composed: true,
        })

        const t = document.elementFromPoint(x, y)

        t.dispatchEvent(ev)
        t.focus()
    }

    move(x, y) {
        let target = document.elementFromPoint(x, y)

        if (!this.target) {
            this.target = target
        }

        if (target !== this.target) {
            this._enter(target, x, y)
            this._leave(this.target, x, y)
            this.target = target
        }

        let ev = new MouseEvent('mousemove', {
            clientX: x,
            clientY: y,
            bubbles: true,
            composed: true,
        })

        target.dispatchEvent(ev)
    }

    /**@private*/
    _enter = (target, x, y) => {
        let ev = new MouseEvent('mouseenter', {
            clientX: x,
            clientY: y,
            composed: true,
        }),
        ev2 = new MouseEvent('mouseover', {
            clientX: x,
            clientY: y,
            bubbles: true,
            composed: true,
        })

        target.dispatchEvent(ev)
        target.dispatchEvent(ev2)
    }

    /**@private*/
    _leave = (target, x, y) => {
        let ev = new MouseEvent('mouseleave', {
            clientX: x,
            clientY: y,
            composed: true,
        }),
        ev2 = new MouseEvent('mouseout', {
            clientX: x,
            clientY: y,
            bubbles: true,
            composed: true,
        })

        target.dispatchEvent(ev)
        target.dispatchEvent(ev2)
    }

    down(x, y, button=0) {
        let ev = new PointerEvent('mousedown', {
            clientX: x,
            clientY: y,   
            button,
            bubbles: true,
            composed: true,
        })

        document.elementFromPoint(x, y).dispatchEvent(ev)
    }

    up(x, y, button=0) {
        let ev = new PointerEvent('mouseup', {
            clientX: x,
            clientY: y,   
            button,
            bubbles: true,
            composed: true,
        })

        document.elementFromPoint(x, y).dispatchEvent(ev)
    }

    setCursorVisible(bool=true) {
        const style = document.body.style

        const visible = typeof bool === 'boolean'
            ? bool
                ? 'auto'
                : 'none'
            : document.body.style
        
        style.cursor = visible
    }
}

export const mouseEventSimulator = new MouseEventSimulator()