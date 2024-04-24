export function setClearFont(detail) {
    const ff = new Set(window.getComputedStyle(document.body)
        .fontFamily
        .split(',')
        .map(v => v.replaceAll('"', '').trim()))

    if (detail) {
        ff.has('Misans') && ff.delete('Misans')
    } else {
        !ff.has('Misans') && ff.add('Misans')
    }

    document.body.style.fontFamily = Array
        .from(ff)
        .map(v => `'${v}'`)
        .join(',')
}