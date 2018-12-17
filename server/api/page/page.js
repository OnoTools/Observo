/**
 * Observo Page API
 * @author ImportProgram
 */

Observo.register(null, {
    GLOBAL: {
        usePage: (name, global, client, callback) => {
            client.on(`${name}_verifyPage`, ({ uuid }) => {
                client.join(uuid)
                let room = null
                let _client = {}
                _client.emit = (event, data) => {
                    client.emit(event, data)
                }
                _client.on = (event, callback) => {
                    client.on(event, callback)
                }
                _client.join = (_room) => {
                    if (room != null) {
                        client.leave(`${uuid}-${room}`)
                    } 
                    room = _room
                    client.join(`${uuid}-${_room}`)
                }
                _client.defaultOnly = () => {
                    if (room != null) {
                        client.leave(`${uuid}-${room}`)
                    } 
                    room = null
                    client.join(uuid)
                }
                let _global = {}
                _global.emit = (event, data, _room = null) => {
                    if (_room != null) {
                        global.in(`${uuid}-${_room}`).emit(event, data)
                    } else {
                        global.in(uuid).emit(event, data)
                    }
                }
                callback(_global, client, uuid)
            })
        }
    }
})

