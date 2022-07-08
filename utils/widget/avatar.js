import {Widget, injectService} from './base'

export class AvatarWidget extends Widget {
    /**
     * @param {{url: string; size?: number; radius?: string;}} avatarOpt 
     */
    constructor(avatarOpt={}) {
        super()

        const img = document.createElement('img')

        const size = avatarOpt.size || 200

        this.style.cssText =
            `border-radius: ${avatarOpt.radius || '50%'};
            display: flex;
            overflow: hidden;
            width: ${size}px;
            height: ${size}px;
            background-color: var(--controlGray);`

        img.style.cssText = `display: none;`
        img.draggable = false
        img.src = avatarOpt.url

        img.onload = () => {
            img.width = size
            img.style.cssText = 'display: block;'
            img.animate([
                {opacity: 0},
                {opacity: 1}
            ], 200)
        }

        this.appendChild(img)
    }
}



injectService.add(AvatarWidget)