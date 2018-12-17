
let projects = {}
let hasUpdateEventMember = false
/**
 * Scouters Plugin 
 * - Has list of all members, and a list for whom is at an event.
 * 
 * Socket Info
 *   [SERVER]             [CLIENT]
 * - team_addMembers <-- scouter_addMembers: Add a member to PROJECT list
 * - team_updateMember <-- team_updateMember: Updates a user infomation, sent by client
 * - team_inviteMember <-- scouter_inviteMember: Adds a member from PROJECT list to an EVENT list
 * - team_renameMember <-- scouter_renameMemeber: Renames a member, must have isEditing event trigger first. 
 * - team_isEditing <--> scouter_isEditing: When a user is editing a member, tell client
 * - team_memberNameUsed --> scouter_memberNameUsed: When a name is already submitted. (converted to lower case)
 * - team_eventList --> team_eventList: List of all events
 */
let callEvent = new EventEmitter()
let ready = false
Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.page.usePage(global, client, (global, client, page) => {

            //START
            if (projects[project] == null) {
                projects[project] = {}
                projects[project].editing = {}
                projects[project].events = {}
                projects[project].fetchedEvents = null
                projects[project].members = {}
            }
            projects[project].editing[uuid] = false

            //Connect to the database. Use it as the "on ready for the user"
            let db = imports.api.database.connect(project, page, () => {
                updateMemberList(false)
                updateEditList(false)
                //Check if events can be used from plugins:events. Only check once per project, then just store it in a variable. Saves database query attempts.
                if (projects[project].fetchedEvents == null) {
                    imports.plugins.events.getEvents(project, (events) => {
                        //Convert it to a proper object
                        let data = {}
                        for (let e in events) {
                            let event = events[e]
                            data[event.uuid] = event.name
                        }
                        projects[project].fetchedEvents = data
                        console.log(`Fetching Event List`)
                        client.emit("team_eventList", data)
                        updateEventMemberList()
                    })
                    //Check if new events are added to PLUGINS:events, this only needs to be made once per project instance. 
                    imports.plugins.events.onNewEvent(project, (events) => {
                        //Convert it to a proper object
                        let data = {}
                        for (let e in events) {
                            let event = events[e]
                            data[event.uuid] = event.name
                        }
                        projects[project].fetchedEvents = data
                        console.log(`Updating Event List`)
                        client.emit("team_eventList", data)
                    })
                } else {
                    //Pull from ram.
                    let data = projects[project].fetchedEvents
                    client.emit("team_eventList", data)
                    updateEventMemberList()
                }
            })

            let updateEventMemberList = () => {
                if (!hasUpdateEventMember) {
                    hasUpdateEventMember = true
                    for (let e in projects[project].fetchedEvents) {
                        console.log(e)
                        console.log("BPOBOBOBOBOBOBOBo")
                        if (projects[project].events[e] == null) {
                            db.fetchByType(`EVENT|${e}`, async (results) => {
                                if (results.length > 0) {
                                    console.log(JSON.stringify(results))
                                    let data = JSON.parse(results[0].data)
                                    console.log(JSON.stringify(data))
                                    projects[project].events[e] = {}
                                    projects[project].events[e] = data
                                }
                            })
                        }
                    }
                    updateScoutList(false)
                }
            }
            //IMPORTANT METHODS
            let updateMemberList = (useGlobal) => {
                db.fetchByType("USER", async (results) => {
                    let members = []
                    for (let result in results) {
                        let data = JSON.parse(results[result].data)
                        data.uuid = results[result].uuid
                        members.push(data)
                    }
                    members.sort(function (a, b) {
                        var nameA = a.lastName.toLowerCase(), nameB = b.lastName.toLowerCase();
                        if (nameA < nameB) //sort string ascending
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    });
                    if (useGlobal) {
                        console.log(`Update Member List Globally`)
                        global.emit("team_updateMembers", members)
                        projects[project].members = members
                        callEvent.emit("updateMembers", project, members)
                    } else {
                        client.emit("team_updateMembers", members)
                        projects[project].members = members
                    }
                })
            }
            /**
             * Update the editing state of the members list
             * @param {Boolen} useGlobal 
             */
            let updateEditList = (useGlobal) => {
                console.log(`Updating User Edit List`)
                if (useGlobal) {
                    global.emit("team_updateEditList", { edits: projects[project].editing })
                } else {
                    client.emit("team_updateEditList", { edits: projects[project].editing })
                }
            }
            /**
             * Update the users who use on an event member list, from all events
             * @param {Boolean} useGlobal 
             */
            let updateScoutList = (useGlobal) => {
                console.log(`Updating Event based Members List`)
                if (useGlobal) {
                    global.emit("team_updateEventMemberList", { teammates: projects[project].events })
                } else {
                    //REQUEST from database
                    client.emit("team_updateEventMemberList", { teammates: projects[project].events })
                }
            }

            /**
             * isEditing - EVent to check if a user is editing/done editing. Verification to edit. 
             */
            client.on("team_isEditing", (data) => {
                //Check if the memeber id is nonething, if so the user don't want to edit no more
                if (data.uuid == false) {
                    client.emit("team_stoppedEdit")
                    projects[project].editing[uuid] = false //Remove the user from the list (making them not edit anything)
                    updateEditList(true) //Update the edit list
                } else {
                    //If they want to editing something, first lets check if someone else is editing them.
                    let pass = true
                    for (let u in projects[project].editing) {
                        let nameUUID = projects[project].editing[u]
                        if (nameUUID == data.uuid) {
                            pass = false
                        }
                    }
                    //If no one editing that member on the team, let them edit it, also update the listr
                    if (pass) {
                        projects[project].editing[uuid] = data.uuid
                        client.emit("team_editingMember", { member: data.uuid })
                        updateEditList(true)
                    }
                }

            })
            /**
             * AddMember - Adds a new member to member list
             */
            client.on("team_addMember", ({ firstName, lastName }) => {
                //Check if they have a first and last name, plus not editing a page (should be false)
                if (firstName != null && lastName != null && !projects[project].editing[uuid]) {
                    console.log(`Added Member (${firstName}, ${lastName})`)
                    let member = { firstName, lastName }
                    db.insert("USER", JSON.stringify(member), () => {
                        updateMemberList(true)
                    })
                }
            })
            /**
             * InviteMember - Adds a member to an event team list. 
             */
            client.on("team_inviteMember", ({ member, event }) => {
                if (event != "none") {
                    if (projects[project].events[event] == null) {
                        projects[project].events[event] = {}
                    }
                    if (projects[project].events[event][member] == null) {
                        console.log(`Invited Member (${member}) to Event (${event})`)
                        projects[project].events[event][member] = false //This boolean is used to disabled/enable the removing of a user.
                    }
                    updateScoutList()
                }
            })
            client.on("team_saveEventMembers", ({ event }) => {
                if (event != "none") {
                    console.log(event)
                    console.log("dslkfhsdfshdkldsfhdshlfdsl")
                    if (projects[project].events[event] != null) {
                        db.insert(`EVENT|${event}`, JSON.stringify(projects[project].events[event]), () => {
                            client.emit("team_savedEvent", { event })
                        })
                    }
                }
            })
            /**
             * UpdateMember - The event used if a user is editing, update that member with UUID
             */

            client.on("team_updateMember", ({ firstName, lastName, member }) => {
                //Check if a user is actually editing a member.
                let pass = false
                for (let u in projects[project].editing) {
                    let nameUUID = projects[project].editing[u]
                    //TODO: check if this user (uuid is u)
                    if (nameUUID == member) {
                        pass = true
                    }
                }
                //If someone is at least editing the member, go along and update it
                if (pass) {
                    if (firstName != null && lastName != null) {
                        let data = { firstName, lastName }
                        db.update(member, JSON.stringify(data), () => {
                            console.log(`Update Member (${member})`)
                            updateMemberList(true) //If update succesful, update member list with new name.
                        })
                    }
                }
            })
            client.on("team_removeMember", ({ member, event }) => {
                if (projects[project].events[event] != null) {
                    if (projects[project].events[event][member] != null) {
                        console.log(`Removing Member (${member}) from Event (${event})`)
                        delete projects[project].events[event][member]
                        updateScoutList()
                    }
                }
            })
        })
    })
    callEvent.on("getEventMembers", (project, event, callback) => {
        if (projects[project] != null) {
            if (projects[project].events[event] != null) {
                callback(projects[project].events[event])
            }
        }
    })
    callEvent.on("getMembers", (project, callback) => {
        imports.api.database.getPagesFromProject(project, (pages) => {
            let db = imports.api.database.connect(project, pages[0].uuid, (name) => {
                db.fetchByType("USER", async (results) => {
                    let members = []
                    for (let result in results) {
                        let data = JSON.parse(results[result].data)
                        data.uuid = results[result].uuid
                        members.push(data)
                    }
                    members.sort(function (a, b) {
                        var nameA = a.lastName.toLowerCase(), nameB = b.lastName.toLowerCase();
                        if (nameA < nameB) //sort string ascending
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    });
                    callback(members)
                })
            })
        })
    })

    //Tell any other plugins (if they are using the global register, it can now send emitter events)
    callEvent.emit("ready")
    ready = "true"
})
Observo.register(null, {
    GLOBAL: {
        getEventMembers: (name, project, event, callback) => {
            //Make function to call
            let main = () => {
                callEvent.emit("getEventMembers", project, event, callback)
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
        },
        getMembers(name, project, callback) {
            let main = () => {
                console.log("GETTING MEMEBERS")
                callEvent.emit("getMembers", project, callback)
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
        },
        updateMembers(name, project, callback) {
            let main = () => {
                callEvent.on("updateMembers", (_project, _members) => {
                    if (project == _project) {
                        callback(_members)
                    }
                })
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