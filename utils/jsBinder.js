const {contextBridge} = require('electron');

module.exports =  class Binder {

    static binders = [];
    static bindAll() {
        this.binders.forEach(binder => binder.createBinding());
    }

    name = 'apis';
    constructor(name) {
        this.name = name;
        Binder.binders.push(this);
    }

    _m = {};

    bind(key, value) {
        this._m[key] = value;
        return this;
    }

    createBinding() {
        contextBridge.exposeInMainWorld(this.name, this._m);
    }
}
