import { store } from '../stores/base.js'

export class AudioData {
    constructor(data) {
        this.data = data
    }

    urls = {}

    /**
     * @returns { string | Uint8Array }
     */
    getPlayUrlAsync = async () => {
        const quality = await store.get('AppSettings/cache')
        const { useBufferOutput } = await store.get('AppSettings/beta_features')
        const qualityStr = quality.qualities[quality.selected].value
        const res = this.urls[quality] = await NeteaseApi.getSongUrlX(
            this.data.id,
            await store.get('cookie'),
            qualityStr
        )
        let url = res.body.data[0].url

        const type = this.type = res.body.data[0].type
        const media = await server.getMedia(`${this.data.id}-${qualityStr}.${type}`, this.onLoadMetadata)

        if (!media) {
            const data = server.saveToCache(url, `${this.data.id}-${qualityStr}.${type}`, this.onLoadMetadata)
            return useBufferOutput
                ? await data
                : url
        }

        const source = useBufferOutput
            ? media
            : URL.createObjectURL(new Blob([media]))

        return source
    }

    onLoadMetadata() {}

    async url(quality='high') {
        if (this.urls[quality]) return this.urls[quality]
        return await this.getPlayUrlAsync(quality)
    }

    title() {
        return this.data.name
    }

    album() {
        return this.data.al
    }

    artist() {
        return this.data.ar
    }

    uri() {
        return this.data.id
    }

}