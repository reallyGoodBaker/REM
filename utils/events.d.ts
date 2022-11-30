declare type Listener = (...args: any[]) => void | Promise<void>;
declare type EventType = string | symbol;
declare type EventHandler = Listener;
interface EventEmitterOptions {
    thisArg?: any;
    captureRejections?: boolean;
    enableWatcher?: boolean;
}
export declare class EventEmitter {
    private maxListeners;
    private _events;
    private captureRejections;
    thisArg: any;
    setMaxListeners(size: number): EventEmitter;
    getMaxListeners(): number;
    private _thisGetter;
    private _getEventLinked;
    private _canAddNew;
    private _addListener;
    addListener(type: EventType, handler: EventHandler): EventEmitter;
    on(type: EventType, handler: EventHandler): EventEmitter;
    prependListener(type: EventType, handler: EventHandler): EventEmitter;
    private _removeListener;
    removeListener(type: EventType, handler: EventHandler): EventEmitter;
    off(type: EventType, handler: EventHandler): EventEmitter;
    removeAllListeners(type: EventType): void;
    private _emit;
    private _emitError;
    emit(type: EventType, ...args: any[]): void;
    emitNone(type: EventType, ...args: any[]): void;
    once(type: EventType, handler: EventHandler): EventEmitter;
    prependOnceListener(type: EventType, handler: EventHandler): EventEmitter;
    listenerCount(type: EventType): number;
    listeners(type: EventType): EventHandler[];
    rawListeners(type: EventType): EventHandler[];
    eventNames(): EventType[];
    constructor(opt?: EventEmitterOptions);
    private _watcher;
    private _enableWatcher;
    connectWatcher(watcher: EventEmitterWatcher): void;
    disconnectWatcher(): void;
    private _callWatcherMethod;
}
interface WatcherMethodArgument {
    type: EventType;
    handler?: Listener;
    prepend?: boolean;
    once?: boolean;
    args?: any[];
}
interface EventEmitterWatcher {
    add?: (arg: WatcherMethodArgument) => void;
    remove?: (arg: WatcherMethodArgument) => void;
    removeAll?: (arg: WatcherMethodArgument) => void;
    emit?: (arg: WatcherMethodArgument) => void;
}
export {};
