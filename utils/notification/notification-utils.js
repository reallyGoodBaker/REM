import { rem } from "../rem"

export function notify(notification={}) {
    rem.emit("notification:send", notification)
}