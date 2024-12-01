import { Provider } from '../../common/provider'
import { Song, songEncodeDecoder } from '../../common/struct/song'
import { registerInMain } from '../registry'
import { db } from '../../node/db'
import { song } from './descriptors'

class SongProvider implements Provider {
    static readonly db = db('songs')

    async read(uri: string): Promise<Buffer> {
        const raw = await SongProvider.db.findOneAsync<{song: Song}>({ uri })

        return Buffer.from(
            songEncodeDecoder.encode(raw.song)
        )
    }

    write(uri: string, value: Buffer) {
        const song = songEncodeDecoder.decode(new Uint8Array(value.buffer))
        const doc = { uri, song }
        SongProvider.db.insert(doc)
    }

    delete(uri: string) {
        SongProvider.db.remove({ uri })
    }
}

export function registerSongProvider() {
    registerInMain(
        song,
        new SongProvider(),
    )
}