const symbol_observers = Symbol('[[Observers]]')
export class Observable {

    /**
     * @private
     */
    [symbol_observers] = new Set()

    addObserver(observer) {
        if (typeof observer === 'function' || typeof observer === 'object' && observer && typeof observer.update === 'function') {
            this[symbol_observers].add(observer)
        }
    }

    removeObserver(observer) {
        if (!observer)  return this.removeAllObservers()
        this[symbol_observers].delete(observer)
    }

    removeAllObservers() {
        this[symbol_observers] = new Set()
    }

    notifyObservers(...args) {
        for (const observer of this[symbol_observers]) {

            if (typeof observer === 'function') 
                observer.call(this, ...args)
            else
                observer.update(this, ...args)

        }
    }
}

