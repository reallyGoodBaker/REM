class WillNull {
    val;
    static NullErr = Error('Null values that may cause errors.');
    constructor(val) {
        this.val = val;
    }
    setValue(val) {
        this.val = val;
    }
    isNull() {
        return this.val === null;
    }
    expect(message) {
        if (this.val !== null) {
            return this.val;
        }
        throw Error(`${message}`);
    }
    unwrap() {
        if (this.val !== null) {
            return this.val;
        }
        throw WillNull.NullErr;
    }
}
function Maybe(val) {
    return new WillNull(val);
}
function Null() {
    return new WillNull(null);
}
class Linked {
    prev = Null();
    next = Null();
    raw = Null();
    handler = Null();
    connect(linked) {
        linked.next.setValue(this.next.expect('Do not operate Linked alone'));
        this.next.expect('Do not operate Linked alone')
            .prev.setValue(linked);
        this.next.setValue(linked);
        linked.prev.setValue(this);
        return linked;
    }
    disconnect() {
        const prevErr = 'get prev fail at disconnect';
        const nextErr = 'get next fail at disconnect';
        this.prev.expect(prevErr)
            .next
            .setValue(this.next.expect(nextErr));
        this.next.expect(nextErr)
            .prev.setValue(this.prev.expect(prevErr));
        this.prev.setValue(null);
        this.next.setValue(null);
        return this;
    }
    record(listener, raw) {
        this.handler.setValue(listener);
        if (raw) {
            this.raw.setValue(raw);
        }
    }
}
class IndexedLinked {
    thisArg;
    rawRecord = new Map();
    record = new Map();
    Entry = new Linked();
    End = new Linked();
    _pointer = this.Entry;
    constructor(thisArg = () => ({})) {
        this.thisArg = thisArg;
        this.Entry.next.setValue(this.End);
        this.End.prev.setValue(this.Entry);
    }
    size() {
        return this.record.size;
    }
    _recordNode(k, v) {
        if (this.record.has(k)) {
            return false;
        }
        this.record.set(k, v);
        return true;
    }
    _recordRawNode(k, v) {
        if (this.rawRecord.has(k)) {
            return false;
        }
        this.rawRecord.set(k, v);
        this._recordNode(v.handler.unwrap(), v);
        return true;
    }
    _creator(listener) {
        let node = new Linked();
        node.record(listener);
        return node;
    }
    _onceCreator(listener) {
        let node = new Linked();
        let self = this;
        const wrapper = (...args) => {
            try {
                node.raw.expect('The function used to wrap is empty')
                    .apply(self.thisArg(), args);
            }
            finally {
                self.deleteNode(node);
            }
        };
        node.record(wrapper, listener);
        return node;
    }
    put(listener) {
        const node = this._creator(listener);
        if (this._recordNode(listener, node)) {
            this._pointer.connect(node);
            this._pointer = node;
        }
    }
    prepend(listener) {
        const node = this._creator(listener);
        if (this._recordNode(listener, node)) {
            this.Entry.connect(node);
        }
    }
    once(listener) {
        const node = this._onceCreator(listener);
        try {
            if (this._recordRawNode(node.raw.unwrap(), node)) {
                this._pointer.connect(node);
                this._pointer = node;
            }
        }
        finally { }
    }
    prependOnce(listener) {
        const node = this._onceCreator(listener);
        try {
            if (this._recordRawNode(node.raw.unwrap(), node)) {
                this.Entry.connect(node);
            }
        }
        finally { }
    }
    deleteNode(node) {
        try {
            if (this._pointer === node) {
                this._pointer = node.prev.unwrap();
            }
            if (!node.raw.isNull()) {
                this.rawRecord.delete(node.raw.unwrap());
            }
            this.record.delete(node.handler.unwrap());
            node.disconnect();
            return true;
        }
        catch (_) {
            return false;
        }
    }
    delete(listener) {
        if (this.rawRecord.has(listener)) {
            const linked = Maybe(this.rawRecord.get(listener) || null).expect("Don't modify Linekd outside of IndexedLinked");
            this.deleteNode(linked);
            return true;
        }
        if (this.record.has(listener)) {
            const linked = Maybe(this.record.get(listener) || null)
                .expect("Don't modify Linekd outside of IndexedLinked");
            this.deleteNode(linked);
            return true;
        }
        return false;
    }
    free() {
        let toDel = this.Entry.next.expect('Free error');
        while (toDel !== this.End) {
            const toDelNext = toDel.next.expect('Free error');
            this.deleteNode(toDel);
            toDel = toDelNext;
        }
        this._pointer = this.Entry;
    }
}
export class EventEmitter {
    maxListeners = -1;
    thisArg = {};
    _events = {};
    captureRejections = false;
    setMaxListeners(size) {
        this.maxListeners = size;
        return this;
    }
    getMaxListeners() {
        return this.maxListeners;
    }
    _thisGetter = () => this.thisArg;
    _getEventLinked(type) {
        let linked;
        if (!(linked = this._events[type])) {
            linked = this._events[type] = new IndexedLinked(this._thisGetter);
        }
        return linked;
    }
    _canAddNew(size) {
        return this.maxListeners !== -1 && size === this.maxListeners;
    }
    _addListener(type, handler, prepend = false, once = false) {
        const linked = this._getEventLinked(type);
        if (this._canAddNew(linked.size())) {
            this._emitError(RangeError('Listeners is full and cannot join a new listener, please use setMaxListeners to resize'));
            return;
        }
        if (prepend) {
            if (once) {
                linked.prependOnce(handler);
            }
            else {
                linked.prepend(handler);
            }
            return;
        }
        if (once) {
            linked.once(handler);
        }
        else {
            linked.put(handler);
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
    removeListener(type, handler) {
        const eventLinked = this._getEventLinked(type);
        eventLinked.delete(handler);
        return this;
    }
    off(type, handler) {
        const eventLinked = this._getEventLinked(type);
        eventLinked.delete(handler);
        return this;
    }
    removeAllListeners(type) {
        this._getEventLinked(type).free();
    }
    _emit(type, nullContext = false, ...args) {
        const l = this._getEventLinked(type);
        const ctx = this.thisArg;
        this.thisArg = nullContext
            ? undefined
            : ctx;
        let cur = l.Entry.next.expect('EventEmitter$_emit');
        while (cur !== l.End) {
            const nextNode = cur.next.expect('EventEmitter$_emit');
            try {
                const returned = cur.handler.unwrap().apply(this.thisArg, args);
                if (this.captureRejections && returned instanceof Promise) {
                    returned.catch(reason => this._emitError(reason));
                }
            }
            catch (err) {
                if (type === 'error') {
                    throw err;
                }
                else {
                    this._emitError(err);
                }
            }
            cur = nextNode;
        }
        this.thisArg = ctx;
    }
    _emitError(err) {
        const size = this.listenerCount('error');
        if (size > 0) {
            try {
                this._emit('error', true, err);
            }
            catch (err) {
                throw err;
            }
            return;
        }
        throw err;
    }
    emit(type, ...args) {
        this._emit(type, false, ...args);
    }
    emitNone(type, ...args) {
        this._emit(type, true, ...args);
    }
    once(type, handler) {
        this._addListener(type, handler, false, true);
        return this;
    }
    prependOnceListener(type, handler) {
        this._addListener(type, handler, true, true);
        return this;
    }
    listenerCount(type) {
        return this._getEventLinked(type).size();
    }
    listeners(type) {
        const ev = this._getEventLinked(type);
        const listeners = [];
        let cur = ev.Entry.next.unwrap();
        while (cur !== ev.End) {
            listeners.push(cur.handler.unwrap());
        }
        return listeners;
    }
    rawListeners(type) {
        const ev = this._getEventLinked(type);
        const listeners = [];
        let cur = ev.Entry.next.unwrap();
        while (cur !== ev.End) {
            try {
                listeners.push(cur.raw.unwrap());
            }
            catch (_) {
                listeners.push(cur.handler.unwrap());
            }
        }
        return listeners;
    }
    eventNames() {
        return Reflect.ownKeys(this._events);
    }
    constructor(opt) {
        if (opt) {
            this.captureRejections = opt.captureRejections || false;
            this.thisArg = opt.thisArg || {};
        }
    }
}
