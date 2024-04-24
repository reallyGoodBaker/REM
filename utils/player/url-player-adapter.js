/// <reference path="./type.d.ts"/>

import { promiseResolvers } from "../high-level/browser/promise"

export class UrlPlayerAdapter {
    #ctx = null
    #audioElement = new Audio()
    #audioElementSource = null

    set onended(v) {
        this.#audioElement.onended = v
    }

    constructor(ctx) {
        this.#ctx = ctx
        this.#audioElementSource = this.#ctx.createMediaElementSource(this.#audioElement)
    }

    play() {
        return this.#audioElement.play()
    }

    pause() {
        return this.#audioElement.pause()
    }

    stop() {
        this.#audioElement.src = null
        this.#audioElementSource.disconnect()
    }

    seek(time) {
        this.#audioElement.currentTime = time
    }

    currentTime() {
        return this.#audioElement.currentTime
    }

    async load(source) {
        if (source === undefined) {
            return this.#audioElement.src !== null
        }

        const {
            promise, resolve
        } = promiseResolvers()

        this.#audioElement.src = source
        this.#audioElement.oncanplay = () => resolve(true)
        this.#audioElement.onerror = () => resolve(false)

        return promise
    }

    playing() {
        return !this.#audioElement.paused
    }

    outputNode() {
        return this.#audioElementSource
    }
}