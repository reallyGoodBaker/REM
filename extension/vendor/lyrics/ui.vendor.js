export function onReady(...args) {
    // console.log(args)

    addCustomUI()
}

function addCustomUI() {
    const layer = document.getElementById('surface-layer')
    const div = document.createElement('div')

    div.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 300px;
    height: 100px;
    border-radius: 12px;
    border: solid 1px var(--controlGray);
    background-color: var(--controlBackground);
    `

    layer.appendChild(div)
    console.log()
}