class Linked {
    static map = new Map();
    HEAD = {
        prev: null,
        next: null
    };
    END = this.HEAD;
    count = 0;
    append(listener, rawListener) {
        const prev = this.END;
        const cur = {
            prev, listener, rawListener, next: null,
        };
        cur.prev = prev;
        cur.listener = listener;
        cur.rawListener = rawListener;
        cur.next = null;
        prev.next = cur;
        this.END = cur;
        Linked.map.set(rawListener || listener, cur);
        this.count++;
        return this;
    }
    prepend(listener, rawListener) {
        const prev = this.HEAD;
        const next = prev.next;
        const cur = {
            prev, listener, rawListener, next
        };
        prev.next = cur;
        if (next) {
            next.prev = cur;
        }
        Linked.map.set(rawListener || listener, cur);
        this.count++;
        return this;
    }
    delete(rawListener) {
        let map = Linked.map, cur = map.get(rawListener);
        if (!cur) {
            return;
        }
        let pre = cur.prev;
        pre.next = cur.next;
        if (cur.next) {
            cur.next.prev = pre;
        }
        map.delete(rawListener);
        this.count--;
        requestIdleCallback(() => {
            cur.prev = null;
            cur.next = null;
        });
        return this;
    }
    deleteAll() {
        let node = this.HEAD;
        while (node = node.next) {
            node.prev = null;
            node.next = null;
            Linked.map.delete(node.rawListener || node.listener);
        }
        this.HEAD.next = null;
        this.count = 0;
        return this;
    }
    [Symbol.iterator]() {
        let ptr = this.HEAD;
        return {
            next() {
                if (ptr.next) {
                    ptr = ptr.next;
                }
                else {
                    return {
                        value: ptr,
                        done: true,
                    };
                }
                return {
                    value: ptr,
                    done: false
                };
            }
        };
    }
}
class EventEmitter {
    /**@private*/
    _events = {};
    maxListeners = -1;
    thisArg = undefined;
    captureRejections = false;
    setMaxListeners(size) {
        this.maxListeners = size;
        return this;
    }
    getMaxListeners() {
        return this.maxListeners;
    }
    /**@private*/
    _addListener(type, handler, prepend = false) {
        let ev;
        if (!~this.maxListeners && this.listenerCount(type) === this.maxListeners) {
            const err = RangeError(`Exceeded maximum capacity(${this.maxListeners}).`);
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
        if (!this._events[type])
            this._events[type] = new Linked();
        ev = this._events[type];
        if (prepend) {
            ev.prepend(handler);
        }
        else {
            ev.append(handler);
        }
    }
    addListener(type, handler) {
        this._addListener(type, handler);
        return this;
    }
    on(type, handler) {
        this._addListener(type, handler);
        return this;
    }
    prependListener(type, handler) {
        this._addListener(type, handler, true);
        return this;
    }
    /**@private*/
    _removeListener(type, handler) {
        let ev;
        if (ev = this._events[type]) {
            ev.delete(handler);
            if (!ev.count) {
                delete this._events[type];
            }
        }
    }
    removeListener(type, handler) {
        this._removeListener(type, handler);
        return this;
    }
    off(type, handler) {
        this._removeListener(type, handler);
        return this;
    }
    removeAllListeners(type) {
        let ev;
        if (ev = this._events[type]) {
            ev.deleteAll();
            delete this._events[type];
        }
    }
    /**@private*/
    _emit(type, thisArg, args) {
        let ev;
        if (ev = this._events[type], !ev) {
            return;
        }
        try {
            let captureRejections = this.captureRejections, node = ev.HEAD;
            while (node = node.next) {
                const returnVal = node.listener.apply(thisArg, args);
                if (captureRejections && returnVal instanceof Promise) {
                    returnVal.catch((err) => {
                        if (this.listenerCount('error')) {
                            this._emitError(err);
                        }
                        else {
                            throw err;
                        }
                    });
                }
            }
        }
        catch (err) {
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
    }
    /**@private*/
    _emitError(err) {
        this._emit('error', undefined, [err]);
    }
    emit(type, ...args) {
        this._emit(type, this.thisArg, args);
    }
    emitNone(type, ...args) {
        this._emit(type, undefined, args);
    }
    bind(thisArg) {
        this.thisArg = thisArg;
        return this;
    }
    /**@private*/
    _onceWrapper(type, handler) {
        return (...args) => {
            this._removeListener(type, handler);
            const val = handler.apply(this.thisArg, args);
            return val;
        };
    }
    /**@private*/
    _once(type, handler, prepend = false) {
        if (!~this.maxListeners && this.listenerCount(type) === this.maxListeners) {
            const err = RangeError(`Exceeded maximum capacity(${this.maxListeners}).`);
            if (this.listenerCount('error')) {
                this._emitError(err);
            }
            else {
                throw err;
            }
        }
        const listener = this._onceWrapper(type, handler);
        let ev;
        if (!this._events[type])
            this._events[type] = new Linked();
        ev = this._events[type];
        if (prepend) {
            ev.prepend(listener, handler);
        }
        else {
            ev.append(listener, handler);
        }
    }
    once(type, handler) {
        this._once(type, handler);
        return this;
    }
    prependOnceListener(type, handler) {
        this._once(type, handler, true);
        return this;
    }
    listenerCount(type) {
        let ev;
        if (ev = this._events[type], !ev) {
            return 0;
        }
        return ev.count;
    }
    listeners(type) {
        let ev;
        let res = [];
        if (ev = this._events[type], !ev) {
            return res;
        }
        let node = ev.HEAD;
        while (node = node.next) {
            res.push(node.listener);
        }
        return res;
    }
    rawListeners(type) {
        let ev;
        let res = [];
        if (ev = this._events[type], !ev) {
            return res;
        }
        let node = ev.HEAD;
        while (node = node.next) {
            if (node.rawListener) {
                res.push(node.rawListener);
            }
        }
        return res;
    }
    eventNames() {
        return Object.getOwnPropertyNames(this._events);
    }
    constructor(opt) {
        if (opt) {
            const { thisArg, captureRejections } = opt;
            if (typeof thisArg !== 'undefined') {
                this.thisArg = thisArg;
            }
            if (captureRejections) {
                this.captureRejections = true;
            }
        }
    }
}
export default EventEmitter;
export { EventEmitter };
