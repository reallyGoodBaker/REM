import { NotificationWidget } from "../../widget/notification/view";
import { EventEmitter } from "./events";

interface Gamepads {
    onConnect(handler: (con: GameController) => void): void;
    onDisconnect(handler: (con: GameController) => void): void;
}

export const gamepads: Gamepads;

export const connectNotif: NotificationWidget

type GameControllerEventTypes = 'press'|'release'|'value'|'axel'|'button-change';

export interface GameController extends EventEmitter {
    readonly id: string;
    readonly mapping: string;
    vibrate(time: number, strongMagnitude=0, weakMagnitude=0): void;
    addPressListener(buttonIndex: numebr, handler: () => void): void;
    removePressListener(buttonIndex: number, handler: () => void): void;
    addReleaseListener(buttonIndex: numebr, handler: () => void): void;
    removeReleaseListener(buttonIndex: number, handler: () => void): void;
    addValueChangeListener(buttonIndex: number, handler: (val: number) => void): void;
    removeValueChangeListener(buttonIndex: numebr, handler: (val: number) => void): void;
    addAxelChangeListener(buttonIndex: number, handler: (val: number) => void): void;
    removeAxelChangeListener(buttonIndex: numebr, handler: (val: number) => void): void;
    on(type: GameControllerEventTypes , handler: (...args: any[]) => void): this;
}

export * from './maps.js'