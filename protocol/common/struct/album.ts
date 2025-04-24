import { Struct } from "../decorator"
import { encodeDecoder } from "../encodeDecoder"
import { malloc } from "./struct"

/**
 * cue sheet
 */
@Struct(
    'Uint16', // year
    'string', // title
    'string', // genre
    'string', // artists
)
export class Album {
    constructor(
        public title: string,
        public artists: string[],
        public genre: string,
        public year: number,
    ) {}

    static encode({
        year, title, genre, artists,
    }: Album): Uint8Array {
        const artistsStr = artists.join('\0')
        const mem = malloc(Album)

        mem.setArray([
            year, title, genre, artistsStr
        ])

        return new Uint8Array(mem.getBytes())
    }

    static decode(buffer: Uint8Array): Album {
        const mem = malloc(Album)
        mem.setUint8Array(buffer)

        const [ year, title, genre, artistsStr ] = mem.get()
        const artists = artistsStr.split('\0')

        return new Album(title, artists, genre, year)
    }
}

export const albumEncodeDecoder = encodeDecoder<Album>(Album.encode, Album.decode)