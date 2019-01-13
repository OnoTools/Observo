
let callEvent = new EventEmitter()
let ready = false
let projects = {}
Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        //Projects global variable (for acesses to anything)
        if (projects[project] == undefined) {
            projects[project] = {}
            projects[project].store = {}
            projects[project].store.listings = null
            projects[project].store.editing = {}
            projects[project].user = {}
            
        }
        //Use the page we want for the project
        imports.api.page.usePage(global, client, (global, client, page) => {
            //Grab the database, for this project, this is created for each user but required.
            let db = imports.api.database.connect(project, page, () => {
                //Default USER variables
                if (projects[project].user[uuid] == null) {
                    projects[project].user[uuid] = {}
                    projects[project].user[uuid].selected = null
                }
                //Clears all editing for this user.
                let clearEditing = () => {
                    for (let store in projects[project].store.editing) {
                        if (projects[project].store.editing[store] == uuid) {
                            projects[project].store.editing[store] = null
                        }
                        global.emit("data_editingStore", projects[project].store.editing)
                    }
                }

                //When a user leaves this plugin
                client.on("disconnect", () => {
                    //Make sure the USER isn't editing any STORES
                    clearEditing()
                    client.disconnect()
                })
                //Create a new store from the user, it has a default name which then can be edited
                client.on("data_newStore", () => {
                    console.log("making store")
                    db.insert("STORE", "New Store", (uuid) => {
                        console.log("new store")
                        projects[project].store.listings[uuid] = "New Store"
                        global.emit("data_storeListings", projects[project].store.listings)
                    })
                })
                //Updates a store based on what a user changed the text to
                client.on("data_updateStore", ({ store, name }) => {
                    //Check if its a vaild store
                    if (projects[project].store.listings[store] != null) {
                        //Check if its THIS user is editing it (vaildate the editor)
                        if (projects[project].store.editing[store] == uuid) {
                            console.log(name)
                            projects[project].store.listings[store] = name
                            global.emit("data_storeListings", projects[project].store.listings)
                            //TODO: Update database as well
                        }
                    }
                })
                //When a user wants to edit a store
                client.on("data_editStore", ({ store }) => {
                    console.log(store)
                    //Check if that STORE is not being edited
                    if (projects[project].store.editing[store] == null) {
                        //Make sure the user isn't already editing a STORE
                        for (let s in projects[project].store.editing) {
                            if (projects[project].store.editing[s] == uuid) {
                                projects[project].store.editing[s] = null
                            }
                        }
                        //Now assign the user to that store
                        projects[project].store.editing[store] = uuid
                    } else {
                        //
                        if (projects[project].store.editing[store] == uuid) {
                            projects[project].store.editing[store] = null
                        }
                    }
                    global.emit("data_editingStore", projects[project].store.editing)
                })

                //When a user selects a store
                client.on("data_selectStore", ({store}) => {
                    if (projects[project].store.listings[store] != null) {
                        projects[project].user[uuid].selected = store
                        //TODO: Put code here to make sure the edit for a OUTLINE gets removed between
                        //STORE swapping
                    }
                })
                /////////////////////////////////////////////////////////////////////////
                //When a user wants to edit the outline, only a single person can edit at a time, just to
                //make sure a user doesn't break the outline (which could happen if I made it a mutli user)
                client.on("data_store_editOutline", ({store}) => {
                  
                })



                client.on("data_store_outlineInsert", ({store}) => {
                    //Check if the store is valid
                    if (projects[project].store.listings[store] != null) {
                        
                        let data = {
                            name: "New Outline",
                            type: "TEXT",
                            relations: {
                                related: false, //if related use outlne UUID of other tag
                                hideNotUsed: true, //only show data for teams used if related.
                            },
                            primary: false, //must be true if related
                        }
                        
                        db.insert(`OUTLINE|${store}`, data, (uuid) => {
                            
                        })
                    } else {
                        socket.emit("data_store_invaild") //INVAILD STORE
                    }
                })

                


                //Give all of the projects to the user
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