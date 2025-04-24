import { Struct } from "../decorator"
import { EncodeDecoder } from "../encodeDecoder"
import { malloc } from "./struct"

@Struct(
    'Float32', // duration
    'Uint32',  // no
    'Uint32',  // start
    'string',  // titles
    'string',  // artist
    'string',  // album
    'string',  // uri
)
export class AudioTrack {
    constructor(
        public titles: string[],
        public artists: string[],
        public album: string,
        public duration: number,
        public uri: string,
        public no: number,
        public start = 0
    ) {}
}

export class AudioTrackEncoderDecoder implements EncodeDecoder<AudioTrack> {

    encode({
        titles, artists, album, duration, uri, no, start
    }: AudioTrack): Uint8Array {
        const titlesStr = titles.join('\0')
        const artistStr = artists.join('\0')
        const mem = malloc(AudioTrack)

        mem.setArray([
            duration, no, start,
            titlesStr, artistStr, album, uri,
        ])

        return new Uint8Array(mem.getBytes())
    }

    decode(encoded: Uint8Array): AudioTrack {
        const mem = malloc(AudioTrack)
        mem.setUint8Array(encoded)

        const [
            duration, no, start,
            titles, artists, album, uri,
        ] = mem.get()

        return new AudioTrack(
            titles.split('\0'),
            artists.split('\0'),
            album,
            duration,
            uri,
            no,
            start
        )
    }
}

export const songEncodeDecoder = new AudioTrackEncoderDecoder()