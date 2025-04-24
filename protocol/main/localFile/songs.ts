import { Provider } from '../../common/provider'
import { AudioTrack, songEncodeDecoder } from '../../common/struct/audioTrack'
import { registerInMain } from '../registry'
import { db } from '../../node/db'
import { song } from './descriptors'

class SongProvider implements Provider {
    readonly db = db('songs')

    async read(uri: string): Promise<Buffer> {
        const raw = await this.db.findOneAsync<{song: AudioTrack}>({ uri })

        return raw ? Buffer.from(
            songEncodeDecoder.encode(raw.song)
        ) : Buffer.alloc(0)
    }

    async write(uri: string, value: Buffer) {
        const song = songEncodeDecoder.decode(new Uint8Array(value.buffer))
        const doc = { uri, song }
        if (await this.db.findOneAsync({ uri })) {
            await this.db.updateAsync({ uri }, doc)
            return
        }

        this.db.insert(doc)
    }

    delete(uri: string) {
        this.db.remove({ uri })
    }
}

export function registerSongProvider() {
    registerInMain(
        song,
        new SongProvider(),
    )
}