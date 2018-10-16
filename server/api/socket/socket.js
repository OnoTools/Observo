/**
 * Socket API for Observo
 * @author ImportProgram
 */

var io = require('socket.io').listen(3000)
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();
const uuidv4 = require('uuid/v4'); //Random
let database = null
let clientsAuth = {}
Observo.onCustomMount((imports) => {
    database = imports.api.database.API.getManager()
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
            if (data.authKey != null) {
                database.signInViaKey(data.authKey, sessionKey, (response) => {
                    if (response != null) {
                        if (connectedClients[response.uuid] != null) {
                            connectedClients[response.uuid].emit("auth_signInNewDevice")
                        }
                        vaildAuth = true
                        userUUID = response.uuid
                        clientsAuth[userUUID] = sessionKey
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
                                if (response != null) {
                                    if (connectedClients[response.uuid] != null) {
                                        connectedClients[response.uuid].emit("auth_signInNewDevice")
                                    }
                                    vaildAuth = true
                                    userUUID = response.uuid
                                    clientsAuth[userUUID] = sessionKey
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
                database.getProject(data.project, (projectData, pages) => {
                    client.emit("core_getProject", {projectData: projectData, pages: pages, plugins: Observo.getDefined()["plugins"]})
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
                            uuid: project.uuid,
                            lastEdited: project.last_edited,
                            plugins: null
                        }
                        data.push(custom)
                    }
                    client.emit("core_projectList", data)
                })
                database.getUser(userUUID, (data) => {
                    let userRoles = JSON.parse(data.role)
                    database.getRoles((roles) => {
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
        client.on("core_pluginList", (data) => {
            if (vaildAuth) {
                client.emit("core_pluginList", Observo.getDefined()["plugins"])
            }
        })
    })
})

let handler = {}

Observo.register(null, {
    GLOBAL: {
        addHandler: (name, callback) => {
            if (handler[name] == null) {
                handler[name] = {}
                console.log("plugins/" + name)
                let main = io.of("plugins/" + name).on('connection', function (client) {
                    client.on("pluginAuth_SignInViaSessionKey", (data) => {       
                            if (clientsAuth[data.uuid]) {
                                if (clientsAuth[data.uuid] == data.sessionKey) {
                                    client.emit("pluginAuth_vaildSesionKey")
                                    callback(main, client, data.uuid, data.project)
                                    console.log(`$EInbound Connection | $f${data.uuid}`)
                                }
                            }
                    })
                })
            } else {
                console.log(`${name} is already a registered event handler!`)
            }
        }
    }
})