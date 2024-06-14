class ForwardProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        console.log(globalThis)
    }
}

registerProcessor('forward-processor', ForwardProcessor)