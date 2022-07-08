import {Widget, injectService} from './base.js'

export class InputWidget extends Widget {
    constructor(isTextarea=false) {
        super()

        const shadow = this.attachShadow({mode: 'open'}),
            type = isTextarea? 'textarea': 'input'

        shadow.innerHTML = `
        <style>
        :host {
            width: fit-content;
            height: fit-content;
            display: block;
        }
        ${type} {
            display: block;
            font-family: Roboto, sans-serif;
            outline: none;
            border: none;
            width: 200px;
            background-color: transparent;
            padding: 8px;
            resize: none;
            height: 16px;
        }
        .input {
            outline: none;
            position: relative;
            overflow: hidden;
            border-radius: 6px;
            background-color: rgba(255,255,255,0.5);
        }
        .input::after {
            content: '';
            position: absolute;
            bottom: 0px;
            left: 50%;
            transform: translateX(-50%);
            width: 0%;
            border-bottom: solid 2px var(--controlColor);
            transition: all 0.16s;
        }
        .input.focus::after {
            width: 100%;
        }
        .txtarea {
            min-height: 160px;
        }
        </style>
        <div class="input" id="c">${isTextarea? '<textarea id="input" class="txtarea"></textarea>': '<input id="input">'}</div>
        `

        this.input = shadow.querySelector('#input')
        this.container = shadow.querySelector('#c')

        this.input.addEventListener('blur', () => {
            this.container.classList.remove('focus')
        })

        this.input.addEventListener('focus', () => {
            this.container.classList.add('focus')
        })
    }

}

injectService.add(InputWidget)