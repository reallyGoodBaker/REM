/// <reference path="./type.d.ts"/>

export class BufferPlayerAdapter {
    #ctx = null
    /**@type {AudioBufferSourceNode}*/
    #audioBufferSource = null
    /**@type {AudioBuffer}*/
    #loadedBuffer = null
    #outputNode = null
    onended = Function.prototype
    #canplay = false
    #playing = false
    #startAt = 0
    #pausedAt = 0
    #played = 0

    constructor(ctx) {
        this.#ctx = ctx
        this.#outputNode = this.#ctx.createGain()
    }

    #onended = () => {
        if (!this.#playing) {
            return
        }

        if (Math.abs(this.currentTime() - this.#loadedBuffer.duration) < 0.1) {
            this.onended()
        }
    }

    #initStates() {
        this.#canplay = false
        this.#playing = false
        this.#startAt = 0
        this.#pausedAt = 0
        this.#played = 0
    }

    play() {
        if (!this.#canplay) {
            return
        }

        this.#loadBuffer()
        this.#audioBufferSource.start(0, this.#played)
        this.#startAt = this.#ctx.currentTime
        this.#playing = true
    }

    #clearBuffer() {
        this.#audioBufferSource.stop()
        this.#audioBufferSource.disconnect()
        this.#audioBufferSource.buffer = null
    }

    #loadBuffer() {
        this.#audioBufferSource = this.#ctx.createBufferSource()
        this.#audioBufferSource.buffer = this.#loadedBuffer
        this.#audioBufferSource.onended = this.#onended
        this.#audioBufferSource.connect(this.#outputNode)
    }

    pause() {
        if (!this.#canplay || !this.#playing) {
            return
        }

        this.#playing = false
        this.#pausedAt = this.#ctx.currentTime
        this.#played += this.#pausedAt - this.#startAt
        this.#clearBuffer()
    }

    stop() {
        if (!this.#canplay) {
            return
        }

        this.#clearBuffer()
        this.#initStates()
    }

    seek(time=0) {
        if (!this.#canplay) {
            return
        }

        this.#clearBuffer()
        this.#loadBuffer()
        this.#audioBufferSource.start(0, time)
        this.#startAt = this.#ctx.currentTime
        this.#played = time
    }

    currentTime() {
        return this.#playing
            ? this.#ctx.currentTime - this.#startAt + this.#played
            : this.#played
    }

    async load(source) {
        if (source === undefined) {
            return this.#canplay
        }

        if (this.#canplay) {
            try {
                this.stop()
            } catch { }
        }

        try {
            this.#loadedBuffer = await this.#ctx.decodeAudioData(source.buffer)
            this.#canplay = true
            return true
        } catch (e) {
            // console.log(e)
            return false
        }
    }

    playing() {
        return this.#playing
    }

    outputNode() {
        return this.#outputNode
    }
}