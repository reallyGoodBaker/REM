import Widget from './base.js'

function buildLayer() {
    const _layer = document.createElement('div')
    _layer.style.cssText = 'display: none; width: 100vw; height: 100vh;'
        + 'position: fixed; top: 0px; left: 0px; pointer-events: all;'

    return _layer
}

export class WillCreateLayerWidget extends Widget {

    static layer = buildLayer()

    static injectLayer(ele) {
        ele.appendChild(this.layer)
    }

    showLayer(fade=true) {
        const color = fade? 'var(--fade)': 'transparent'
        WillCreateLayerWidget.layer.style.display = 'block'
        WillCreateLayerWidget.layer.animate([
            {opacity: 0, backgroundColor: color},
            {opacity: 1, backgroundColor: color}
        ], {
            duration: 100,
            fill: 'forwards'
        })
    }

    disableLayer() {
        WillCreateLayerWidget.layer.animate([
            {opacity: 1},
            {opacity: 0}
        ], 100).onfinish = () => WillCreateLayerWidget.layer.style.display = 'none'
    }

    getLayer() {
        return WillCreateLayerWidget.layer
    }
}