const player = require('../../runtime/player/main')
const { provide } = require('../../runtime/main/invoker')
const { interval } = require('../../runtime/main/schedule')

interval(() => {
    console.log('next track')
    player.next()
}, 10000)

console.log('YES!!!!!!')

provide('beforeDisable', () => {
    console.log('NO!!!!!!!')
})