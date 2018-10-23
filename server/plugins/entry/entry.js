
let localEvents = new EventEmitter()
Observo.onMount((imports) => {
    let pages = {}
    imports.api.database.hasDefaultPage()
    //localhost:300/plugins/entry <-- auth UUID, PROJECT
    imports.api.socket.addHandler((global, client, uuid, project) => {
        //
        imports.api.page.usePage(global, client, (global, client, page) => {
            let db = imports.api.database.connect(project, page, async () => {
                db.fetchByType("OUTLINE", async (results) => {
                    client.emit("entry_updateStructure", { structure: JSON.parse(results[0].data) })
                    
                })
                sendEntryList()
                let name = await db.getNameByUUID(uuid)
                client.emit("entry_userName", { name})
            })

            let sendEntryList = () => {
                db.fetchByType("ENTRY", async (results) => {
                    let entries = {}
                    for (let result in results) {
                        //The UUID of that Entry
                        let _uuid = results[result].uuid
                        //The JSON data of the entry
                        let data = JSON.parse(results[result].data)
                        //The UUID of the user who submits that entry
                        let name = await db.getNameByUUID(data.uuid)

                        //The real values of the entry.
                        let entry = data.entry
                        entries[_uuid] = { entry, name }
                    }
                    global.emit("entry_listUpdate", entries)
                    localEvents.emit("entry_listUpdate", entries)
                }, {
                        backwards: true
                    })
            }


            //INIT
            if (pages[page] == null) {
                pages[page] = {}
                pages[page].users = {}
                pages[page].data = {}
                pages[page].viewing = {}
            }
            imports.api.database.getNameByUUID(uuid, (name) => {
                console.log(`$2${name} connected.`)
                pages[page].users[uuid] = name
                pages[page].data[uuid] = {}
                pages[page].viewing[uuid] = {}
                global.emit("entry_newUser", { uuid, name: name })
            })
            for (let user in pages[page].users) {
                if (user != uuid) {
                    if (pages[page].users[user] != null) {
                        global.emit("entry_newUser", { uuid: user, name: pages[page].users[user] })
                    }
                }
            }
            client.on("entry_updateOutline", ({ structure }) => {
                console.log(JSON.stringify(structure))
                console.log("UPDATING OUTLINE")
                db.isType("OUTLINE", (result) => {
                    console.log(result)
                    if (result) {
                        db.updateAll("OUTLINE", JSON.stringify(structure), () => {
                            global.emit("entry_updateStructure", {structure})
                            localEvents.emit("entry_updateOutline", {structure})
                        })
                    } else {
                        db.insert("OUTLINE", JSON.stringify(structure), () => {
                            global.emit("entry_updateStructure", {structure})
                            localEvents.emit("entry_updateOutline", {structure})
                        })
                    }
                })
            })
            client.on("entry_updateData", (data) => {
                //console.log(`${pages[page].users[uuid]} updated`)
                let object = data.uuid
                let value = data.value
                pages[page].data[uuid][object] = value
                for (let user in pages[page].viewing) {
                    //console.log(`${pages[page].users[uuid]} looping towards ${pages[page].users[user]}`)
                    if (pages[page].viewing[user] == uuid && user != uuid) {
                        //console.log(`$1${pages[page].users[uuid]} sending to ${pages[page].users[user]}`)
                        global.emit("entry_viewingUpdate", { user: uuid, data: pages[page].data[uuid] })
                    }
                }
            })
            client.on("entry_submitEntry", (data) => {
                let insert = {}
                insert.uuid = uuid
                insert.entry = data.entry
                console.log("ENTRY!!!")
                db.insert("ENTRY", JSON.stringify(insert), () => {
                    for (let object in pages[page].data[uuid]) {
                        pages[page].data[uuid][object] = ""
                    }
                    for (let user in pages[page].viewing) {
                        //console.log(`${pages[page].users[uuid]} looping towards ${pages[page].users[user]}`)
                        if (pages[page].viewing[user] == uuid && user != uuid) {
                            //console.log(`$1${pages[page].users[uuid]} sending to ${pages[page].users[user]}`)
                            global.emit("entry_viewingUpdate", { user: uuid, data: pages[page].data[uuid] })
                        }
                    }
                    sendEntryList()
                })
            })

            client.on("entry_viewingUser", (data) => {
                let user = data.uuid
                //console.log(`${pages[page].users[uuid]} locked to ${pages[page].users[user]}`)
                pages[page].viewing[uuid] = user
                global.emit("entry_viewingUpdate", { user: user, data: pages[page].data[user] })
            })
            client.on("entry_viewingExit", () => {
                pages[page].viewing[uuid] = null
            })
            client.on("disconnect", () => {
                global.emit("entry_removeUser", { uuid: uuid })

                pages[page].users[uuid] = null
                pages[page].viewing[uuid] = null
                pages[page].data[uuid] = null
            })
        })

    })
})
Observo.register(null, {
    GLOBAL: {
        onEntry: (name, a) => {
            localEvents.on("entry", (data) => {
                a(data)
            })
        }
    },
})