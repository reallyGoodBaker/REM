import { promiseResolvers, Provider } from '../../common/provider'
import { Song, songEncodeDecoder } from '../../common/struct/song'
import { registerInMain } from '../registry'
import { db } from './db'
import { songs } from './descriptors'

class SongsProvider implements Provider {
    readonly db = db('songs')

    async read(uri: string): Promise<Buffer> {
        const { promise, resolve, reject } = promiseResolvers<Song>()
        this.db.findOne<{song: Song}>({ uri }, (_, doc) => {
            if (_) {
                reject(_)
            }

            resolve(doc.song)
        })

        return Buffer.from(
            songEncodeDecoder.encode(await promise)
        )
    }

    write(uri: string, value: Buffer) {
        const song = songEncodeDecoder.decode(new Uint8Array(value.buffer))
        const doc = { uri, song }
        this.db.insert(doc)
    }

    delete(uri: string) {
        this.db.remove({ uri })
    }
}

export function registerSongsProvider() {
    registerInMain(
        songs,
        new SongsProvider(),
    )
}