const outputAudio = new Audio()
let _stream = null

export function initOutputAudio(stream) {
    _stream = stream
    outputAudio.srcObject = _stream
    outputAudio.play()
}

let deviceIdUsing = 'default'
export async function setOutputDeviceId(id) {
    if (!id) return

    if (id !== deviceIdUsing) {
        try {
            await outputAudio.setSinkId(id)
            deviceIdUsing = id
        } catch (err) {
            return false
        }

        return true
    }
}

export function setPluginOutput(bool=true) {
    outputAudio.srcObject = bool
        ? null
        : _stream

    if (!bool) {
        outputAudio.play()
    }
}

export function getOutputDeviceId() {
    return deviceIdUsing
}

export async function indexOfOutputDevice(devices) {
    let i = 0
    for (const device of devices) {
        if (device.deviceId === deviceIdUsing) {
            return i
        }
        i++
    }
    return -1
}