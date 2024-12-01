import { encodeDecoder } from "../encodeDecoder"
import { malloc, StructDescriptor } from "./struct"

export class Song {
    constructor(
        public id: number,
        public name: string,
        public artist: string[],
        public album: string,
        public duration: number,
        public uri: string,
        public isFavorite: boolean
    ) {}

    static struct: StructDescriptor = {
        layout: () =>
            [
                'Uint32', // id
                'Float32', // duration
                'Uint8',  // isFavorite
                'string', // name
                'string', // artist
                'string', // album
                'string', // uri
            ]
    }

    static encode({
        id, name, artist, album, duration, uri, isFavorite
    }: Song): Uint8Array {
        const artistStr = artist.join('\0')
        const mem = malloc(Song.struct)

        mem.setArray([
            id, duration, isFavorite? 1 : 0,
            name, artistStr, album, uri,
        ])

        return new Uint8Array(mem.getBytes())
    }

    static decode(encoded: Uint8Array): Song {
        const mem = malloc(Song.struct)
        mem.setUint8Array(encoded)

        const [
            id, duration, isFavorite,
            name, artist, album, uri,
        ] = mem.get()

        return new Song(id, name, artist.split('\0'), album, duration, uri, isFavorite === 1)
    }

}

export const songEncodeDecoder = encodeDecoder<Song>(Song.encode, Song.decode)