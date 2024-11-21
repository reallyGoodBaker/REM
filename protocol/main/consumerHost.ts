import { ipcMain } from 'electron'
import { lookup } from './registry'
import { getOrCreateConsumer } from './registry'

class ConsumerHost {
    read(name: string, uri: string) {
        const consumer = getOrCreateConsumer(name)
        return consumer?.read(uri)
    }

    write(name: string, uri: string, data: any) {
        const consumer = getOrCreateConsumer(name)
        return consumer?.write(uri, data)
    }

    delete(name: string, uri: string) {
        const consumer = getOrCreateConsumer(name)
        return consumer?.delete(uri)
    }
}

function exclude(obj: any, ...keys: string[]) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)))
}

export function setupConsumerHost() {
    const consumerHost = new ConsumerHost()

    ipcMain.handle('consumer.read', (_, name, uri) => {
        const result = consumerHost.read(name, uri)
        return result
    })

    ipcMain.handle('consumer.write', (_, name, uri, data) => {
        const result = consumerHost.write(name, uri, data)
        return result
    })

    ipcMain.handle('consumer.delete', (_, name, uri) => {
        const result = consumerHost.delete(name, uri)
        return result
    })

    ipcMain.handle('consumer.lookup', (_, conf) => {
        return lookup(conf).map(desc => exclude(desc, 'provider'))
    })
}