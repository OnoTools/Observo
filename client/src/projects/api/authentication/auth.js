//Example (Client) Page
let auth = null
let managerLocal = require("import-window")
let args = managerLocal.parseArgs()
Observo.register(null, {
    GLOBAL: {
        use: (name, socket) => {
            socket.emit("pluginAuth_SignInViaSessionKey", {...auth, project: args.project})
        },
        vaild: (name, socket, callback) => {
            socket.on("pluginAuth_vaildSesionKey", () => {
                callback()
            })
        },
        uuid: () => {
            return auth.uuid
        }
    },
    API: {
        updateAuth: (data) => {
            auth = data
        }
    }
})