//Example (Client) Page
let io = require("socket.io-client")
let managerLocal = require("import-window")
let args = managerLocal.parseArgs()
let auth = null
Observo.register(null, {
    GLOBAL: {
        use: (name, id) => {
            let args = managerLocal.parseArgs()
            console.log(`http://${args.ip}/plugins/${name}`)
            let socketObject = io.connect(`http://${args.ip}/plugins/${name}`)
            return socketObject
        },
    }
})