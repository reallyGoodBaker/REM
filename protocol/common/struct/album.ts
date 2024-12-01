import { encodeDecoder } from "../encodeDecoder"
import { malloc, StructDescriptor } from "./struct"

/**
 * cue sheet
 */
export class Album {
    constructor(
        public title: string,
        public artists: string[],
        public genre: string,
        public year: number,
    ) {}

    static readonly struct: StructDescriptor = {
        layout: () =>
            [
                'Uint16', // year
                'string', // title
                'string', // genre
                'string', // artists
            ]
    }

    static encode({
        year, title, genre, artists,
    }: Album): Uint8Array {
        const artistsStr = artists.join('\0')
        const mem = malloc(Album.struct)

        mem.setArray([
            year, title, genre, artistsStr
        ])

        return new Uint8Array(mem.getBytes())
    }

    static decode(buffer: Uint8Array): Album {
        const mem = malloc(Album.struct)
        mem.setUint8Array(buffer)

        const [ year, title, genre, artistsStr ] = mem.get()
        const artists = artistsStr.split('\0')

        return new Album(title, artists, genre, year)
    }
}

export const albumEncodeDecoder = encodeDecoder<Album>(Album.encode, Album.decode)