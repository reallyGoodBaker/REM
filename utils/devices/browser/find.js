import {LifeCycle, rem} from '../../rem.js'

export async function getAudioDevices() {
    // MediaDeviceInfo prototype properties are not copied by Electron's context bridge.
    return (await navigator.mediaDevices.enumerateDevices())
        .filter(v => v.kind === 'audiooutput')
        .map(({ label, deviceId, groupId, kind }) => ({ label, deviceId, groupId, kind }))
}

export async function initAudioDevicesFind() {
    await LifeCycle.when('runtimeReady')
    
    navigator.mediaDevices.addEventListener('devicechange', async () => {
        rem.emit('audioDeviceChange', await getAudioDevices())
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
