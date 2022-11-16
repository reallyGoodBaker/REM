export function getColorInfo(imgData, w, x, y) {
    let o = 4 * (w * (y - 1) + x)
    imgData = imgData.data
    let data = imgData.slice(o, o + 4)
    return data
}

export function rgbtohsl(r, g, b) {
    r = r / 255
    g = g / 255
    b = b / 255

    var min = Math.min(r, g, b)
    var max = Math.max(r, g, b)
    var l = (min + max) / 2
    var difference = max - min
    var h, s, l
    if (max == min) {
        h = 0
        s = 0
    } else {
        s = l > 0.5 ? difference / (2.0 - max - min) : difference / (max + min);
        switch (max) {
            case r: h = (g - b) / difference + (g < b ? 6 : 0); break
            case g: h = 2.0 + (b - r) / difference; break
            case b: h = 4.0 + (r - g) / difference; break
        }
        h = Math.round(h * 60)
    }
    s = Math.round(s * 100)//转换成百分比的形式
    l = Math.round(l * 100)
    return [h, s, l]
}

const canvas = new OffscreenCanvas(0, 0)
const canvasCtx = canvas.getContext('2d')

export function getColor(img, alpha = 1) {
    if (!img) return 'transparent'
    /**
     * @type {CanvasRenderingContext2D}
    */
    let cctx = canvasCtx;
    const w = img.width, h = img.height
    canvas.width = w
    canvas.height = h

    cctx.drawImage(img, 0, 0)
    const imageData = cctx.getImageData(0, 0, w, h)

    const w12 = w / 2, h12 = h / 2, w14 = w / 4, w34 = w12 + w14, h14 = h / 4, h34 = h12 + h14
    let lt = getColorInfo(imageData, w, w14, h14),
        rt = getColorInfo(imageData, w, w34, h14),
        c = getColorInfo(imageData, w, w12, h12),
        lb = getColorInfo(imageData, w, w14, h34),
        rb = getColorInfo(imageData, w, w34, h34)

    let color = [];

    for (let i = 0; i < 4; i++) {
        let aver = (lt[i] + rt[i] + c[i] + lb[i] + rb[i]) / 5
        color[i] = ~~aver
    }

    color = rgbtohsl(...color)

    const colorStr = `hsla(${color[0]},${color[1] > 40 ? 40 : color[1]}%,${color[2] > 50 ? 50 : color[2]}%, ${alpha})`;

    return colorStr
}