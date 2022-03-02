
const symbolRawListener = Symbol();

function onceWrapper(type, rawFunc, emitter) {
    function onceListener(...args) {
        rawFunc.apply(emitter.thisArg, args);
        emitter.off(type, onceListener);
    }

    onceListener[symbolRawListener] = rawFunc;

    return onceListener;
}


export class EventEmitter {

    static captureRejections = true;
    static defaultMaxListeners = -1;
    static thisArg = undefined;

    /**
     * @private
     */
    events = {};

    /**
     * @private
     */
    maxListeners = EventEmitter.defaultMaxListeners;

    /**
     * @param {number} size 
     */
    setMaxListeners(size) {
        this.maxListeners = size;
        return this;
    }

    /**
     * 
     * @returns 
     */
    getMaxListeners() {
        return this.maxListeners;
    }

    /**
     * 
     * @param {string|Symbol} type 
     * @param {(...args) => void} handler 
     */
    addListener(type, handler) {

        if (!handler || typeof handler !== 'function') {
            throw TypeError(`arg1 is not type of  "function", received: ${typeof handler}`);
        }

        if (this.events[type]) {
            const arr = this.events[type], len = this.maxListeners;
            if (~len && arr.length === this.maxListeners) {
                throw RangeError(`Out of range. max: ${len}`);
            }
            arr.push(handler);
        } else {
            this.events[type] = [handler];
        }
        return this;
    }

    /**
     * 
     * @param {string} type 
     * @param {(...args) => void | undefined} handler 
     * @returns 
     */
    removeListener(type, handler) {
        if (typeof handler !== 'function') return this.removeAllListeners(type);
        let arr = this.events[type];
        if (arr) {
            arr = [...arr];
            const len = arr.length;
            let result = [];

            for (let i = 0; i < len; i++) {
                if (arr[i] === handler || arr[i].toString() === handler.toString()) {
                    continue;
                }
                result.push(arr[i]);
            }

            this.events[type] = result;

            return this;
        }
    }

    /**
     * 
     * @param {string|Symbol} type
     * @returns {number}
     */
    removeAllListeners(type) {
        delete this.events[type];
        this.events[type] = null;
        return this;
    }

    /**
     * 
     * @param {string} type 
     * @param  {...any} args 
     */
    emit(type, ...args) {
        let arr = this.events[type], emitSucces = false;
        if (arr) {
            arr = [...arr];
            const len = arr.length;

            try {
                for (let i = 0; i < len; i++)
                    arr[i].apply(this.thisArg, args);

                emitSucces = true;
            } catch (e) {

                if (this.captureRejections) {
                    this.emit('error', e);
                }

            }

            return emitSucces;
        }

        return false;
    }

    /**
     * 
     * @param {string} type 
     * @param {(...args)=>void} handler
     */
    once(type, handler) {
        this.addListener(type, onceWrapper(type, handler, this));
        return this;
    }

    /**
     * 
     * @param {string} type 
     * @returns {Array<any>}
     */
    listeners(type) {
        return [...this.events[type]];
    }

    /**
     * 
     * @param {string} type 
     * @returns {Array<any>}
     */
    rawListeners(type) {
        let ls = this.events[type];
        if (ls) return ls.reduce((pre, cur) => {
            return [...pre, cur[symbolRawListener] || cur];
        }, []);

        return [];
    }

    /**
     * 
     * @param {string} type 
     * @returns 
     */
    listenerCount(type) {
        return this.events[type] ? this.events[type].length : 0;
    }

    /**
     * 
     * @param {string|Symbol} type 
     * @param {(...args)=>void} handler 
     */
    prependListener(type, handler) {

        if (!handler || typeof handler !== 'function') {
            throw TypeError(`arg1 is not type of  "function", received: ${typeof handler}`);
        }

        if (this.events[type]) {
            const arr = this.events[type], len = this.maxListeners;
            if (~len && arr.length === this.maxListeners) {
                throw RangeError(`Out of range. max: ${len}`);
            }
            arr.unshift(handler);
        } else {
            this.events[type] = [handler];
        }
        return this;
    }


    /**
     * 
     * @param {string|Symbol} type 
     * @param {(...args)=>void} handler 
     */
    prependOnceListener(type, handler) {
        this.prependListener(onceWrapper(type, handler, this));
        return this;
    }

    /**
     * @private
     */
    thisArg = EventEmitter.thisArg;
    /**
     * @private
     */
    captureRejections = true;

    /**
     * 
     * @param {{thisArg?: any, captureRejections?: boolean}} opt 
     */
    constructor(opt) {

        /**
         * alias
         */
        this.on = this.addListener;
        this.off = this.removeListener;
        //addition
        this.offAll = this.removeAllListeners;

        if (opt) {
            this.thisArg = opt.thisArg || EventEmitter.thisArg;
            this.captureRejections = opt.captureRejections || EventEmitter.captureRejections;
        }

    }

}

export function on(emitter, type, handler) {
    return emitter.on(type, handler);
}
export function off(emitter, type, handler) {
    return emitter.off(type, handler)
}
export function once(emitter, type, handler) {
    return emitter.once(type, handler);
}
export function listeners(emitter, type) {
    return emitter.listeners(type);
}
export function rawListeners(emitter, type) {
    return emitter.rawListeners(type);
}

function IEvents(opt) { return new EventEmitter() }

IEvents.prototype = EventEmitter.prototype;

IEvents.EventEmitter = EventEmitter;
IEvents.on = on;
IEvents.off = off;
IEvents.once = once;
IEvents.listeners = listeners;
IEvents.rawListeners = rawListeners;

export default IEvents;