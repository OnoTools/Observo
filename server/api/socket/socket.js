/**
 * Socket API for Observo
 * @author ImportProgram
 */

var io = require('socket.io').listen(3000)
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();
const uuidv4 = require('uuid/v4'); //Random

Observo.onCustomMount((imports) => {
    let database = imports.api.database.API.getManager()
    let connectedClients = {}
    let socket = io.of("/core/").on('connection', function (client) {
        let sessionKey = uuidv4()
        let vaildAuth = false
        let userUUID = null
        console.log("$ENew Client: $f" + sessionKey)
        client.once('disconnect', function () {
            console.log("$DClient Disconnected: $f" + sessionKey)
            client.disconnect()
        })
        client.on("auth_signIn", function (data) {
            console.log(JSON.stringify(data))
            if (data.authKey != null) {
                database.signInViaKey(data.authKey, sessionKey, (response) => {
                    console.log(JSON.stringify(response))
                    if (response != null) {
                        if (connectedClients[response.uuid] != null) {
                            connectedClients[response.uuid].emit("auth_signInNewDevice")
                        }
                        vaildAuth = true
                        userUUID = response.uuid
                        client.emit("auth_vaildSignin", { authKey: response.authKey, sessionKey: sessionKey, uuid: response.uuid })
                        connectedClients[response.uuid] = client
                        console.log("VALID USER (because it is)")
                    }
                })
            }
            if (data.password != null && data.username != null) {
                let username = data.username.trim()
                let password = data.password.trim()
                if (username != "" && username.length > 2 && password.length > 3) {
                    database.isUser(username, (check) => {
                        if (!check) {
                            /**
                             * TODO:
                             * CHECK SETTINGS HERE IF ADMIN DOESN'T WANT USER TO CREATE ACCOUNT
                             */
                            //socket.emit("vaild_signUp", { username: username })
                        } else {
                            database.signIn(username, password, sessionKey, (response) => {
                                console.log(JSON.stringify(response))
                                if (response != null) {
                                    if (connectedClients[response.uuid] != null) {
                                        connectedClients[response.uuid].emit("auth_signInNewDevice")
                                    }
                                    vaildAuth = true
                                    userUUID = response.uuid
                                    client.emit("auth_vaildSignin", { authKey: response.authKey, sessionKey: sessionKey, uuid: response.uuid })
                                    connectedClients[response.uuid] = client
                                }
                            })
                        }
                    })
                }
            }
        })
        client.on("core_getProject", (data) => {
            if(vaildAuth) {
                database.getProject(data.project, (projectData) => {
                    client.emit("core_getProject", projectData)
                })
            }
        })
        client.on("core_projectList", (data) => {
            if (vaildAuth) {
                database.listProjects((projects) => {
                    let data = []
                    for (let p in projects) {
                        let project = projects[p]
                        let custom = {
                            name: project.name,
                            lastEdited: project.last_edited,
                            plugins: null
                        }
                        data.push(custom)
                    }
                    client.emit("core_projectList", data)
                })
                database.getUser(userUUID, (data) => {
                    console.log(JSON.stringify(data))
                    let userRoles = JSON.parse(data.role)

                    database.getRoles((roles) => {
                        console.log("-----")
                        console.log(JSON.stringify(roles))
                        let roleData = []
                        for (let i in userRoles) {
                            let userRole = userRoles[i]
                            for (let j in roles) {
                                let role = roles[j]
                                if (userRole == role.uuid) {
                                    roleData.push({ name: role.name, uuid: role.uuid, color: role.color })
                                }
                            }
                        }
                        client.emit("core_userData", { name: data.username, roles: roleData })
                    })
                })
            }
        })

    })
})

let handler = {}

Observo.register(null, {
    GLOBAL: {
        addHandler: (callback) => {
            let name;
            try { throw new Error(); }
            catch (e) {
                var re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
                re.exec(st), m = re.exec(st);
                name = m[1] || m[2];
            }
            console.log(name)
            if (handler[name] == null) {
                handler[name] = {}
                let main = io.of("/plugins/" + name).on('connection', function (client) {
                    let events = []
                    const auth = true; //TODO: Make it not a constant
                    events.push("auth")
                    let checkOn = (name, callback) => {
                        for (let e in events) {
                            if (e != name) {
                                client.on(name, () => { if (auth) { callback() } })
                            }
                        }
                    }
                    let _main = { emit: (name, value) => { if (auth) { main.emit(name, value) } } }
                    let _client = { on: checkOn }
                    //this should be called when the auth process is done tbo
                    callback(_main, _client)
                })
            } else {
                console.log(`${name} is already a registered event handler!`)
            }
        }
    }
})