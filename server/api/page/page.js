/**
 * Observo Page API
 * @author ImportProgram
 */

Observo.register(null, {
    GLOBAL: {
        usePage: (name, global, client, callback) => {
            client.on(`${name}_verifyPage`, ({ uuid }) => {
                client.join(uuid)
                let _global = {}
                _global.emit = (event, data) => {
                    global.in(uuid).emit(event, data)
                }
                callback(_global, client, uuid)
            })
        }
    }
})