const outputAudio = new Audio()

export function initOutputAudio(stream) {
    outputAudio.srcObject = stream
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