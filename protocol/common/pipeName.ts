const PIP_NAMES = {
    win32: `\\\\?\\pipe\\rem\\`,
    linux: '/tmp/rem/',
}

export const getPipeName = (platform: keyof typeof PIP_NAMES) => {
    return PIP_NAMES[platform]
}

export const pipeName = () => {
    return getPipeName(process.platform as keyof typeof PIP_NAMES) || PIP_NAMES.linux
}

export const ppath = (name: string) => {
    return `${pipeName()}${name}`
}