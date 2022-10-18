export class AudioData {
    constructor(data) {
        this.data = data
    }

    urls = {}

    getPlayUrlAsync = async (quality='high') => {
        let br
        
        try {
            br = quality === 'low'? this.data.l.br:
                quality === 'medium'? this.data.m.br: this.data.h.br
        } catch (error) {
            switch (quality) {
                case 'low': 
                    br = this.data.h? this.data.h.br: false
                    if(br) break
                case 'high':
                    br = this.data.m? this.data.m.br: false
                    if(br) break
                case 'medium': 
                    br = this.data.l? this.data.l.br: false
                    if(br) break
            }
        }


        const res = this.urls[quality] = await NeteaseApi.getSongUrl(this.data.id, await store.get('cookie'), br)
        let url = res.body.data[0].url


        const media = await server.getMedia(`ne${this.data.id}`, this.onLoadMetadata)

        if (!media) {
            server.saveToCache(url, `ne${this.data.id}`, this.onLoadMetadata)
            return url
        }
        
        return URL.createObjectURL(
            new Blob([media])
        )
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