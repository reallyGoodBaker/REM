import init, { run } from '../pkg/node_graph.js'

await init()

run(100, 100, (...args) => {
    console.log(args)
})