import Widget from './base.js'

function buildLayer() {
    const _layer = document.createElement('div')
    _layer.style.cssText = 'z-index: 3; display: none;'
        + 'position: fixed; width: 100vw; height: 100vh; top: 0px; left: 0px;'

    document.body.appendChild(_layer)
    return _layer
}

const layer = buildLayer()

export class WillCreateLayerWidget extends Widget {

    showLayer(fade=true) {
        const color = fade? 'var(--fade)': 'transparent'
        layer.style.display = 'block'
        layer.animate([
            {opacity: 0, backgroundColor: color},
            {opacity: 1, backgroundColor: color}
        ], {
            duration: 100,
            fill: 'forwards'
        })
    }

    disableLayer() {
        layer.animate([
            {opacity: 1},
            {opacity: 0}
        ], 100).onfinish = () => layer.style.display = 'none'
    }

    getLayer() {
        return layer
    }
}