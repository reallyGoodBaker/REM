import {rem} from '../../rem.js'

export async function getAudioDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(v => v.kind === 'audiooutput')
}

export async function initAudioDevicesFind() {
    navigator.mediaDevices.addEventListener('devicechange', async ev => {
        rem.emit('audioDeviceChange', (await ev.target.enumerateDevices()).filter(v => v.kind === 'audiooutput'))
    })
}

import {setOutputDeviceId, getOutputDeviceId} from './output.js'

export function watchAudioDeviceChange() {
    rem.on('audioDeviceChange', async devices => {

        for (const device of devices) {
            if (device.deviceId === getOutputDeviceId()) {
                return
            }
        }

        setOutputDeviceId('default')
    })
}