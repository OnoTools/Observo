/**
 * DataStore
 * The DataStore module allows for data to be stored, in STORES.
 * STORES are a type of stucture that can be created, just how like a normal
 * relational database would. Each "store" has an outline. The outline can be used
 * to defined the "real store" (aka sub stores). 
 * 
 * Also stores can relate to one another. This can be useful for making sure data is
 * inserted correctly
 * 
 * @copyright OnoTools
 * @author ImportProgram
 */


let callEvent = new EventEmitter()
let ready = false
let projects = {}


class DataStoreSystem {
    constructor(project) {
        this.project = project

        this.outlines = {}
        this.outlines.name = {}
        this.outlines.data = {}
        this.outlines.fetched = false
        //What a user is editing
        this.editing = {}
        this.editing.renameOutline = {}
        this.editing.renameStore = {} //Stores
        this.editing.editField = {}

        this.editing.editOutlineStructure = {} //The fields
        this.editing.editOutlineConfig = {} //Locked and Rules

        //What a user has selected
        this.selected = {}
        this.selected.outline = {}
        this.selected.store = {}
    }

    /**
     * Creates a new store from the user.
     * @param global Global Socket
     * @param client Client Socket
     * @param uuid User Identiier
     */
    initNewOutline(db, global, client, uuid) {
        client.on("data_newOutline", () => {
            db.insert("OUTLINE", "New Store Outline", (id) => {
                this.outlines.name[id] = "New Store Outline"
                this.outlines.data[id] = {}
                this.outlines.data[id].stores = {}
                this.outlines.data[id].config = {}
                this.outlines.data[id].structure = {}
                this.outlines.data[id].fields = {}
                console.log("Building New Outline")
                //Config for the outline
                let config = {
                    locked: false, //Is this OUTLINE locked?
                    rules: []
                }
                //Also create the config for the outline
                db.insert(`CONFIG|${id}`, JSON.stringify(config), async () => {
                    console.log("$2--> Created Config")
                    this.outlines.data[id].config = config
                })
                let field = {
                    name: "ID",
                    type: "NUMBER",
                    required: true,
                    hidden: false,
                    locked: true,
                }
                //Also create the field for the outline
                db.insert(`FIELD|${id}`, JSON.stringify(field), async (fid) => {
                    console.log("$3--> Created Primary Field")
                    this.outlines.data[id].fields[fid] = field

                    //Also create the strucutre for the outline, and add the field to it
                    //This is only why its running after the field is created to grab the ID 
                    //of it..
                    let structure = [fid]
                    db.insert(`STRUCTURE|${id}`, JSON.stringify(structure), async () => {
                        console.log("$3--> Built Structure")
                        this.outlines.data[id].structure = structure
                    })
                })

                let outlines = {}
                outlines.name = this.outlines.name
                outlines.locked = {}
                for (let o in this.outlines.name) {
                    outlines.locked[o] = this.outlines.data[o].config
                }
                global.emit("data_outlines", outlines)
            })
        })
    }
    /**
     * Handler for renaming the outline
     * @param {Object} db Database Connection for the project/page
     * @param {Object} global Global Socket
     * @param {Object} client Client Socket
     * @param {String} uuid User Identiier
     */
    initRenameOutline(db, global, client, uuid) {
        //Checks if the user editing is already editing something, if so it removes
        //the user from the object (by making it null)
        let clearEdits = () => {
            for (let o in this.editing.renameOutline) {
                let user = this.editing.renameOutline[o]
                if (user == uuid) {
                    this.editing.renameOutline[o] = null
                }
            }
        }
        //Update the editing of all user renaming an outline
        let updateEditings = () => {
            //TODO: If null, don't send it
            global.emit("data_editing_renameOutline", this.editing.renameOutline)
        }
        client.on("data_renameOutline", ({ outline }) => {
            //Check is the outline is vaild
            if (this.outlines.name[outline] != null) {
                if (this.editing.renameOutline[outline] == null) {
                    clearEdits() //If editing another outline, get rid of it
                    this.editing.renameOutline[outline] = uuid
                    updateEditings()
                } else {
                    clearEdits() //Just clear the one there are already editing.
                    updateEditings()
                }
            } else {
                //TODO: Send message to client
                console.log("$4Invaild Outline!")
            }
        })
    }
    /**
     * Updates the name of an outline when a user has finished renamign it.
     * @param {Object} db Database Connection for the project/page
     * @param {Object} global Global Socket
     * @param {Object} client Client Socket
     * @param {String} uuid User Identiier
     */
    initUpdateRenameOutline(db, global, client, uuid) {
        let clearEdits = () => {
            for (let o in this.editing.renameOutline) {
                let user = this.editing.renameOutline[o]
                if (user == uuid) {
                    this.editing.renameOutline[o] = null
                }
            }
        }
        //Update the editing of all user renaming an outline
        let updateEditings = () => {
            //TODO: If null, don't send it
            global.emit("data_editing_renameOutline", this.editing.renameOutline)
        }
        //Updates a outline based on what a user has renamed it too
        client.on("data_update_renameOutline", ({ outline, name }) => {
            if (this.outlines.name[outline] != null) {
                //Check if its THIS user is editing it (vaildate the editor)
                if (this.editing.renameOutline[outline] == uuid && name != undefined) {
                    console.log(`Updated Outline Name: ${this.outlines.name[outline]} --> ${name}`)
                    this.outlines.name[outline] = name
                    this.sendOutlines(global)
                    clearEdits() //Just clear the one there are already editing.
                    updateEditings()
                    db.update(outline, name, () => {
                        console.log("Update Outline Database Entry")
                    })
                }
            }
        })
    }
    /*********************************************************************************************************************
     * Create a new store based on an outline
     * @param {*} global 
     * @param {*} client 
     * @param {*} uuid 
     */
    initNewStore(db, global, client, uuid) {
        client.on("data_newStore", (data) => {
            console.log("New store")
            let outline = data.outline
            //Check if the outline is real
            if (this.outlines.name[outline] != null) {
                //Create the store
                db.insert(`STORE|${outline}`, "New Store Outline", (id) => {
                    this.outlines.data[outline].stores[id] = "Store: " + this.outlines.name[outline]

                    //Only send the stores to the client, reduce traffic when nessary.
                    this.sendStores(global)
                    console.log("Created New Store Outline")
                })
            } else {
                //TODO: Send message to client
                console.log("$4Invaild Outline!")
            }




        })
    }
    /**
    * Handler for renaming a store
    * @param {Object} db Database Connection for the project/page
    * @param {Object} global Global Socket
    * @param {Object} client Client Socket
    * @param {String} uuid User Identiier
    */
    initRenameStore(db, global, client, uuid) {
        //Checks if the user editing is already editing something, if so it removes
        //the user from the object (by making it null)
        let clearEdits = () => {
            for (let o in this.editing.renameStore) {
                let user = this.editing.renameStore[o]
                if (user == uuid) {
                    this.editing.renameStore[o] = null
                }
            }
        }
        let updateEditings = () => {
            global.emit("data_editing_renameStore", this.editing.renameStore)
        }
        client.on("data_renameStore", (data) => {
            let outline = data.outline
            let store = data.store
            console.log(outline)
            console.log(store)
            //Check is the outline is vaild
            if (this.outlines.name[outline] != null) {
                //Check if the store is created based on the outline
                if (this.outlines.data[outline].stores[store] != null) {
                    if (this.editing.renameStore[store] == null) {
                        clearEdits() //If editing another outline, get rid of it
                        this.editing.renameStore[store] = uuid
                        updateEditings()
                    } else {
                        clearEdits() //Just clear the one there are already editing.
                        updateEditings()
                    }
                } else {
                    //TODO: Send message to client
                    console.log("$4Invaild Store!")
                }
            } else {
                //TODO: Send message to client
                console.log("$4Invalid Outline!")
            }
        })
    }
    /**
     * Updates the name of an outline when a user has finished renamign it.
     * @param {Object} db Database Connection for the project/page
     * @param {Object} global Global Socket
     * @param {Object} client Client Socket
     * @param {String} uuid User Identiier
     */
    initUpdateRenameStore(db, global, client, uuid) {
        //Updates a outline based on what a user has renamed it too
        let clearEdits = () => {
            for (let o in this.editing.renameStore) {
                let user = this.editing.renameStore[o]
                if (user == uuid) {
                    this.editing.renameStore[o] = null
                }
            }
        }
        let updateEditings = () => {
            global.emit("data_editing_renameStore", this.editing.renameStore)
        }
        client.on("data_update_renameStore", ({ outline, store, name }) => {
            //Check if the outline is real
            if (this.outlines.name[outline] != null) {
                //Check if the store is created based on the outline
                if (this.outlines.data[outline].stores[store] != null) {
                    //Check if its THIS user is editing it (vaildate the editor)
                    if (this.editing.renameStore[store] == uuid) {
                        console.log(`Updated Store Name: ${this.outlines.data[outline].stores[store]} --> ${name}`)
                        this.outlines.data[outline].stores[store] = name
                        clearEdits() //Just clear the one there are already editing.
                        updateEditings()
                        //Only send the stores to the client, reduce traffic when nessary.
                        let outlines = {}
                        for (let o in this.outlines.data) {
                            outlines[o] = this.outlines.data[o].stores
                        }

                        global.emit("data_stores", outlines)

                    }
                } else {
                    //TODO: Send message to client
                    console.log("$4Invaild Store!")
                }
            } else {
                //TODO: Send message to client
                console.log("$4Invaild Outline!")
            }
        })
    }
    /******************************************************************************************************************
    * Adds a field to an outline, and update the structure
    * @param {Object} db Database Connection for the project/page
    * @param {Object} global Global Socket
    * @param {Object} client Client Socket
    * @param {String} uuid User Identiier
    */
    initAddField(db, global, client, uuid) {
        //Wait for client to send event
        client.on("data_newField", ({ outline }) => {
            //Check if the outline is real
            if (this.outlines.name[outline] != null) {

                let field = {
                    name: "Example Field",
                    type: "TEXT",
                    required: false,
                    hidden: false,
                    locked: false,
                    status: "0"
                }
                db.insert(`FIELD|${outline}`, JSON.stringify(field), (fid) => {
                    this.outlines.data[outline].fields[fid] = field

                    this.sendFields(global, outline)
                })
            } else {
                //TODO: Send message to client
                console.log("$4Invaild Outline!")
            }
        })
    }
    initEditField(db, global, client, uuid) {
        //Checks if the user editing is already editing something, if so it removes
        //the user from the object (by making it null)
        let clearEdits = () => {
            for (let o in this.editing.editField) {
                let user = this.editing.editField[o]
                if (user == uuid) {
                    this.editing.editField[o] = null
                }
            }
        }
        let updateEditings = () => {
            global.emit("data_editing_editField", this.editing.editField)
        }
        client.on("data_editField", (data) => {
            let outline = data.outline
            let field = data.field
            console.log(outline)
            console.log(field)
            //Check is the outline is vaild
            if (this.outlines.name[outline] != null) {
                //Check if the field is created based on the outline
                if (this.outlines.data[outline].fields[field] != null) {
                    if (this.editing.editField[field] == null) {
                        clearEdits() //If editing another outline, get rid of it
                        this.editing.editField[field] = uuid
                        updateEditings()
                    } else {
                        clearEdits() //Just clear the one there are already editing.
                        updateEditings()
                    }
                } else {
                    //TODO: Send message to client
                    console.log("$4Invaild Field!")
                }
            } else {
                //TODO: Send message to client
                console.log("$4Invalid Outline!")
            }
        })
    }
    initUpdateField(db, global, client, uuid) {
        let clearEdits = () => {
            for (let o in this.editing.editField) {
                let user = this.editing.editField[o]
                if (user == uuid) {
                    this.editing.editField[o] = null
                }
            }
        }
        let updateEditings = () => {
            global.emit("data_editing_editField", this.editing.editField)
        }
        client.on("data_update_editField", (data) => {
            let outline = data.outline
            let field = data.field

            let name = data.name
            let type = data.type.toLowerCase()
            let status = data.status
            let required = data.required

            //Check if the outline is real
            if (this.outlines.name[outline] != null) {
                //Check if the store is created based on the outline
                if (this.outlines.data[outline].fields[field] != null) {
                    //Check if its THIS user is editing it (vaildate the editor)
                    if (this.editing.editField[field] == uuid) {


                        if (type != null) {
                            if (type != "number" || type != "string" || type != "image") {
                                type = "number"
                            }
                        } else {
                             type = "number"
                        }

                        if (status != null) {
                            //Status
                            //0 = pending
                            //1 = active
                            //2 = archived
                            if (status != "0" || status != "1" || status != "2") {
                                status = "0"
                            }
                        } else {
                            status = "0"
                        }
                        if (required == null) {
                            required = false
                        }
                        if (name == null) {
                            name = "Name This Field"
                        } 
                        let field = this.outlines.data[outline].field[field]

                        field.name = name
                        field.type = type
                        field.required = required
                        field.hidden = false
                        field.locked = false
                        field.status = status

                        clearEdits() 
                        updateEditings()


                        this.sendFields(global, outline)
                        //TODO: Update Database

                    }
                } else {
                    //TODO: Send message to client
                    console.log("$4Invaild Store!")
                }
            } else {
                //TODO: Send message to client
                console.log("$4Invaild Outline!")
            }
        })
    }




    /******************************************************************************************************************
    * Set the selected OUTLINE and/or STORE based on what the user sets. 
    * Also make them join that room for that group
    * @param {Object} db Database Connection for the project/page
    * @param {Object} global Global Socket
    * @param {Object} client Client Socket
    * @param {String} uuid User Identiier
    */
    initSelect(db, global, client, uuid) {
        client.on("data_select", (data) => {
            let outline = data.outline
            let store = data.store
            if (outline != null) {
                //Check if this outline is a valid outline
                console.log("yes")
                if (this.outlines.name[outline] != null) {
                    console.log("yess yess yess yess")
                    //Set this users selected outline
                    this.selected.outline[uuid] = outline
                    client.join(outline)
                    if (store != null) { //Make sure the store is not empty
                        //Check if store is valid store
                        if (this.outlines.data[outline].stores[store] != null) {
                            this.selected.store[uuid] = store
                        }
                        //TODO: Send Table
                    }
                    //Send the fields to the client
                    this.sendFields(client, outline)
                    this.sendStores(client)
                }
            }
        })
    }

    /******************************************************************************************************************
     * When a user disconnects, do any final processes needed for the user
     * @param {Object} db Database Connection for the project/page
     * @param {Object} global Global Socket
     * @param {Object} client Client Socket
     * @param {String} uuid User Identiier
     */
    initDisconnect(db, global, client, uuid) {
        client.on("disconnect", () => {
            //Make sure the USER isn't editing any STORES
            this.revokeEditing(global, client, uuid)
            client.disconnect()
        })
    }
    /**
     * Make sure anything a USER is editing becomes revoked, meaning
     * that anything be edited goes back to a default state, so if someone 
     * else wants to edit that object it can be used.
     * @param global Global Socket
     * @param client Client Socket
     * @param uuid User Identiier
     */
    revokeEditing(global, client, uuid) {
        for (let o in this.editing.renameOutline) {
            let user = this.editing.renameOutline[o]
            if (user == uuid) {
                this.editing.renameOutline[o] = null
            }
            global.emit("data_renameOutline")
        }
    }
    getData(db, global, client, uuid) {
        let getConfigFetchAsync = (id) => {
            return new Promise((resolve) => {
                db.fetchByType(`CONFIG|${id}`, (results) => {
                    let config = JSON.parse(results[0].data)
                    console.log(results[0].data)
                    resolve(config)
                })
            })
        }
        if (this.outlines.fetched == false) {
            this.outlines.fetched = true
            db.fetchByType("OUTLINE", async (outlines) => {
                let data = {}
                for (let outline in outlines) {
                    let id = outlines[outline].uuid
                    let name = outlines[outline].data
                    let config = await getConfigFetchAsync(id)
                    console.log(`${name} | CONFIG`)
                    this.outlines.name[id] = name
                    this.outlines.data[id] = {}
                    this.outlines.data[id].stores = {}
                    this.outlines.data[id].config = config
                    this.outlines.data[id].structure = {}
                    this.outlines.data[id].fields = {}
                    db.fetchByType(`STRUCTURE|${id}`, async (structure) => {
                        console.log(`${name} | STRUCTURE`)
                        let data = JSON.parse(structure[0].data)
                        this.outlines.data[id].structure = data
                    })
                    db.fetchByType(`FIELD|${id}`, async (fields) => {
                        for (let field in fields) {
                            let fid = fields[field].uuid
                            let data = JSON.parse(fields[field].data)
                            this.outlines.data[id].fields[fid] = data
                            console.log(`${name} | FIELD | ${fid}`)
                        }
                    })
                    db.fetchByType(`STORE|${id}`, async (stores) => {
                        for (let store in stores) {
                            let sid = stores[store].uuid
                            let data = stores[store].data
                            this.outlines.data[id].stores[sid] = data
                            console.log(`${name} | STORE | ${sid}`)
                        }
                    })
                    this.sendOutlines(global)
                }
            })
        } else {
            this.sendOutlines(global)
        }

    }
    sendFields(method, outline) {
        if (this.outlines.name[outline] != null) {
            console.log("Sending Fields To the user")
            method.emit("data_fields", this.outlines.data[outline].fields, outline)
        }
    }

    sendOutlines(method) {
        let outlines = {}
        outlines.name = this.outlines.name
        outlines.locked = {}
        for (let o in this.outlines.name) {
            outlines.locked[o] = this.outlines.data[o].config
        }
        method.emit("data_outlines", outlines)
    }
    sendStores(method) {
        let outlines = {}
        for (let o in this.outlines.data) {
            outlines[o] = this.outlines.data[o].stores
        }
        method.emit("data_stores", outlines)
    }
}


Observo.onMount((imports) => {
    console.log("MOUNTED IMPROVED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        let store = null
        //Projects global variable (for acesses to anything)
        if (projects[project] == undefined) {
            projects[project] = new DataStoreSystem(project)
        }
        store = projects[project]

        //Use the page we want for the project
        imports.api.page.usePage(global, client, (global, client, page) => {
            //Grab the database, for this project, this is created for each user but required.
            let db = imports.api.database.connect(project, page, () => {
                store.initNewOutline(db, global, client, uuid)
                store.initRenameOutline(db, global, client, uuid)
                store.initUpdateRenameOutline(db, global, client, uuid)
                store.initNewStore(db, global, client, uuid)
                store.initRenameStore(db, global, client, uuid)
                store.initUpdateRenameStore(db, global, client, uuid)
                store.initAddField(db, global, client, uuid)
                store.initSelect(db, global, client, uuid)
                store.initDisconnect(db, global, client, uuid)
                store.getData(db, global, client, uuid)
            })
        })
    })
})
Observo.register(null, {
    GLOBAL: {
        example: () => {
            Observo.didMount(() => {

            })
        }
    }
})