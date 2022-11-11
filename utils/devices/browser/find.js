import {LifeCycle, rem} from '../../rem.js'

export async function getAudioDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(v => v.kind === 'audiooutput')
}

export async function initAudioDevicesFind() {
    await LifeCycle.when('runtimeReady')
    
    navigator.mediaDevices.addEventListener('devicechange', async ev => {
        rem.emit('audioDeviceChange', (await ev.target.enumerateDevices()).filter(v => v.kind === 'audiooutput'))
    })
}

import {setOutputDeviceId, getOutputDeviceId} from './output.js'

export async function watchAudioDeviceChange() {
    await LifeCycle.when('runtimeReady')

    rem.on('audioDeviceChange', async devices => {

        for (const device of devices) {
            if (device.deviceId === getOutputDeviceId()) {
                return
            }
        }

        setOutputDeviceId('default')
    })
}