/**
 * Observo Page API
 * @author ImportProgram
 */

Observo.register(null, {
    GLOBAL: {
        usePage: (name, global, client, callback) => {
            client.on(`${name}_verifyPage`, ({ uuid }) => {
                //TODO: Add some properchecking to see if this is a real page.
                
                client.join(uuid)
                let room = null
                let _client = {}
                //Normal Client emitter
                _client.emit = (event, data) => {
                    client.emit(event, data)
                }
                //Normal Client event
                _client.on = (event, callback) => {
                    client.on(event, callback)
                }
                //Custom Join event for custom rooms.
                //Sub room of the page its on. Can be useful if
                //a single page needs to emit to different user
                //groups. The default room (which is the page UUID)
                //will always be there.
                _client.join = (_room) => {
                    if (room != null) {
                        client.leave(`${uuid}-${room}`)
                    } 
                    room = _room
                    client.join(`${uuid}-${_room}`)
                }
                //Leave the room if not being used, 
                _client.defaultOnly = () => {
                    if (room != null) {
                        client.leave(`${uuid}-${room}`)
                    } 
                    room = null //Make it nothing
                }
                let _global = {}
                //Normal global emit but also the custom room emitter.
                _global.emit = (event, data, _room = null) => {
                    if (_room != null) {
                        global.in(`${uuid}-${_room}`).emit(event, data)
                    } else {
                        global.in(uuid).emit(event, data)
                    }
                }
                //Give it a callback
                callback(_global, client, uuid)
            })
        }
    }
})

