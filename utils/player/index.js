import {globalPlayer} from './player.js'
import {MainPlaylist} from './playlist.js'

navigator.mediaSession.setActionHandler('play', () => globalPlayer.play())
navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause())
navigator.mediaSession.setActionHandler('nexttrack', () => MainPlaylist.playNext())
navigator.mediaSession.setActionHandler('previoustrack', () => MainPlaylist.playPrev())