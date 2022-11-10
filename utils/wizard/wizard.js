import {injectService} from '../widget/base.js'
import {PopWindowWidget} from '../widget/popwin.js'
import {rem} from '../rem.js'

function button(text) {
    const btn = document.createElement('div')
    btn.innerText = text
    btn.classList.add('btn', 'radius', 'px4', 'margin')
    btn.style.display = 'none'
    return btn
}

export class WizardContainer extends PopWindowWidget {
    /**@private*/ _pageIndex = 0
    /**@private*/ _pages = []

    localeParser

    get pageIndex() {
        return this._pageIndex
    }

    set pageIndex(v) {
        if (v < 0 || v >= this._pages.length) {
            return false
        }

        if (!v) {
            this.setButtonsDisplay(1|4)
            this.next.innerText = this.localeParser('next_step')
        } else if(v === this._pages.length - 1) {
            this.setButtonsDisplay(1|2|4)
            this.next.innerText = this.localeParser('done')
        } else {
            this.setButtonsDisplay(1|2|4)
            this.next.innerText = this.localeParser('next_step')
        }

        this._changePage(this._pageIndex, v)
        this._pageIndex = v
        this.progress.value = v + 1
    }

    /**@private*/ _changePage(from, to) {
        const direction = to - from > 0
            ? -1
            : 1

        this.content.children[0].animate([
            {transform: 'translateX(0)', opacity: 1},
            {transform: `translateX(${direction * 25}%)`, opacity: 0},
        ], 100).onfinish = () => {
            this.content.children[0].remove()
            this.content.appendChild(this._pages[to])
            this._pages[to].animate([
                {transform: `translateX(${direction * -25}%)`, opacity: 0},
                {transform: `translateX(0)`, opacity: 1},
            ], 100)
        }


    }
    

    constructor() {
        super()

        this.style.cssText = 'width: 420px;'
            + 'pointer-events: all;'
            + 'display: none;'
            + 'height: 560px;'
            + 'max-height: 88%;'
            + 'border-radius: 8px;'
            + 'box-shadow: 0px 8px 12px rgba(0,0,0,0.32);'
            + 'overflow: hidden;'
            + 'background-color: var(--controlBackground);'
            + 'position: absolute;'
            + 'top: 50%; left: 50%; transform: translate(-50%, -50%);'

        const progress = document.createElement('progress'),
            content = document.createElement('div'),
            btnGroup1 = document.createElement('div'),
            btnGroup2 = document.createElement('div'),
            next = button('下一步'),
            prev = button('上一步'),
            cancel = button('取消')


        this.progress = progress
        this.content = content
        this.next = next
        this.prev = prev
        this.cancel = cancel

        progress.value = 0
        progress.classList.add('horizontal')

        content.style.cssText = 'width: 100%; height: fit-content; min-height: 488px;'

        prev.classList.add('bright')
        next.classList.add('accent')
        cancel.classList.add('light')

        prev.addEventListener('click', () => {
            if (this.pageIndex === 1) {
                this.setButtonsDisplay(1|4)
            }
            this.pageIndex--
        })
        next.addEventListener('click', () => {
            if (this.pageIndex === this._pages.length - 1) {
                return this.onFinishWizard()
            }
            this.pageIndex++
            this.setButtonsDisplay(1|2|4)
        })
        
        btnGroup2.appendChild(prev)
        btnGroup2.appendChild(next)

        btnGroup1.appendChild(cancel)
        btnGroup1.appendChild(btnGroup2)

        btnGroup1.classList.add('Row')
        btnGroup2.classList.add('Row')
        btnGroup1.style.justifyContent = 'space-between'
        btnGroup1.style.backgroundColor = 'var(--controlBrighter)'
        btnGroup1.style.padding = '12px'

        this.appendChild(progress)
        this.appendChild(content)
        this.appendChild(btnGroup1)

        cancel.addEventListener('click', () => this.hide())

        this.setButtonsDisplay(1|4)

        rem.on('langChange', l => {
            const s = this.localeParser = (...args) => l.s(...args)
            next.innerText = s('next_step')
            prev.innerText = s('prev_step')
            cancel.innerText = s('cancel')
        })
    }

    onFinishWizard() {}

    addPage(...children) {
        for (const child of children) {
            this._pages.push(child)
        }

        if (!this.progress.value) {
            this.progress.value = 1
            this.content.appendChild(this._pages[0])
        }
        this.progress.max = this._pages.length
    }

    /**@private*/ setButtonsDisplay(displayInfo) {
        const next = !!(displayInfo & 1),
            prev = !!(displayInfo & 2),
            cancel = !!(displayInfo & 4)

        this.next.style.display = next
            ? ''
            : 'none'

        this.prev.style.display = prev
            ? ''
            : 'none'

        this.cancel.style.display = cancel
            ? ''
            : 'none'
    }

    setProgress(val) {
        this.progress.value = val
    }

}

injectService.add(WizardContainer)

export class ButtonDisplay {
    static NEXT = 1
    static PREV = 2
    static CANCEL = 4
}