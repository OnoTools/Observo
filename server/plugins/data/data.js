
let callEvent = new EventEmitter()
let ready = false
let projects = {}
Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        if (projects[project] == undefined) {
            projects[project] = {}
            projects[project].store = {}
            projects[project].store.listings = null
            projects[project].store.editing = {}
        }
        imports.api.page.usePage(global, client, (global, client, page) => {
            let db = imports.api.database.connect(project, page, () => {

                let clearEditing = () => {
                    for (let store in projects[project].store.editing) {     
                        if (projects[project].store.editing[store] == uuid) {
                            projects[project].store.editing[store] = null
                        }
                        global.emit("data_editingStore", projects[project].store.editing)
                    }
                }



                //When a user leaves this plugin
                client.on("end", () => {

                    //Make sure the USER isn't editing any STORES
                    clearEditing()



                    client.disconnect()
                })
                client.on("data_newStore", () => {
                    console.log("making store")
                    db.insert("STORE", "New Store", (uuid) => {
                        console.log("new store")
                        projects[project].store.listings[uuid] = "New Store"
                        global.emit("data_storeListings", projects[project].store.listings)
                    })
                })
                client.on("data_updateStore", ({ store, name }) => {
                    if (projects[project].store.listings[store] != null) {
                        console.log(name)
                        projects[project].store.listings[store] = name
                        global.emit("data_storeListings", projects[project].store.listings)
                        //TODO: Update database as well
                    }
                })
                client.on("data_editStore", ({ store }) => {
                    console.log(store)
                  
                    if (projects[project].store.editing[store] == null) {
                        for (let s in projects[project].store.editing) {
                            if (projects[project].store.editing[s] == uuid) {
                                projects[project].store.editing[s] = null
                            }
                        }
                        projects[project].store.editing[store] = uuid
                    } else {
                        if (projects[project].store.editing[store] == uuid) {
                            projects[project].store.editing[store] = null
                        }
                    }
                    global.emit("data_editingStore", projects[project].store.editing)
                })
                if (projects[project].store.listings == null) {
                    db.fetchByType("STORE", (results) => {
                        let data = {}
                        for (let result in results) {
                            let uuid = results[result].uuid
                            data[uuid] = results[result].data
                            projects[project].store.editing[uuid] = null
                        }
                        projects[project].store.listings = data
                        client.emit("data_storeListings", projects[project].store.listings)
                        client.emit("data_editingStore", projects[project].store.editing)
                    })
                } else {
                    client.emit("data_storeListings", projects[project].store.listings)
                    client.emit("data_editingStore", projects[project].store.editing)
                }
            })
        })
    })
    callEvent.on("getStores", (project, callback) => {
        if (projects[project].store.listings == null) {
            db.fetchByType("STORE", (results) => {
                console.log(JSON.stringify(results))
            })
        } else {
            callback(projects[project].store.listings)
        }
    })
    callEvent.emit("ready")
    ready = true
})
Observo.register(null, {
    GLOBAL: {
        getStores: () => (name, project, callback) => {
            //Make function to call
            let main = () => {
                callEvent.emit("getStores", project, callback)
            }
            //Is the plugin ready?
            if (ready) {
                main()
            } else {
                //If not lets wait for it to send the event
                callEvent.once("ready", () => {
                    main()
                })
            }
        }
    },
})