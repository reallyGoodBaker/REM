export function hue(rgb) {
    let r = rgb.slice(0, 2), g = rgb.slice(2, 4), b = rgb.slice(4, 6)
    r = parseInt(r, 16), g = parseInt(g, 16), b = parseInt(b, 16)
    r /= 255, g /= 255, b /= 255
    let max = Math.max(r, g, b), min = Math.min(r, g, b)

    let h = 0

    if (max !== min) {
        let d = max - min
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h *= 60
    }
    return h
}