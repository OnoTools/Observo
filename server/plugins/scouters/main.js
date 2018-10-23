
let projects = {}
/**
 * Scouters Plugin 
 * - Has list of all members, and a list for whom is at an event.
 * 
 * Socket Info
 *   [SERVER]             [CLIENT]
 * - scouters_addMembers <-- scouter_addMembers: Add a member to PROJECT list
 * - scouters_updateMember <-- scouters_updateMember: Updates a user infomation, sent by client
 * - scouters_inviteMember <-- scouter_inviteMember: Adds a member from PROJECT list to an EVENT list
 * - scouters_renameMember <-- scouter_renameMemeber: Renames a member, must have isEditing event trigger first. 
 * - scouters_isEditing <--> scouter_isEditing: When a user is editing a member, tell client
 * - scouters_memberNameUsed --> scouter_memberNameUsed: When a name is already submitted. (converted to lower case)
 * - scouters_eventList --> scouters_eventList: List of all events
 */
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

            }
            projects[project].editing[uuid] = false

            //Connect to the database. Use it as the "on ready for the user"
            let db = imports.api.database.connect(project, page, () => {
                updateMemberList(false)
                updateScoutList(false)
                updateEditList(false)
            })
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
                    client.emit("scouters_eventList", data)
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
                    client.emit("scouters_eventList", data)
                })
            } else {
                //Pull from ram.
                let data = projects[project].fetchedEvents
                client.emit("scouters_eventList", data)
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
                        global.emit("scouters_updateMembers", members)
                    } else {
                        client.emit("scouters_updateMembers", members)
                    }
                })
            }
            /**
             * Update the editing state of the members list
             * @param {Boolen} useGlobal 
             */
            let updateEditList = (useGlobal) => {
                if (useGlobal) {
                    global.emit("scouters_updateEditList", { edits: projects[project].editing })
                } else {
                    client.emit("scouters_updateEditList", { edits: projects[project].editing })
                }
            }
            /**
             * Update the users who use a scout list, from all events
             * @param {Boolean} useGlobal 
             */
            let updateScoutList = (useGlobal) => {
                if (useGlobal) {
                    global.emit("scouters_updateScoutList", { scouters: projects[project].events })
                } else {
                    //REQUEST from database
                    client.emit("scouters_updateScoutList", { scouters: projects[project].events })
                }
            }

            /**
             * isEditing - EVent to check if a user is editing/done editing. Verification to edit. 
             */
            client.on("scouters_isEditing", (data) => {
                //Check if the memeber id is nonething, if so the user don't want to edit no more
                if (data.uuid == false) {
                    client.emit("scouters_stoppedEdit")
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
                        client.emit("scouters_editingMember", { member: data.uuid })
                        updateEditList(true)
                    }
                }

            })
            /**
             * AddMember - Adds a new member to member list
             */
            client.on("scouters_addMember", ({ firstName, lastName }) => {
                //Check if they have a first and last name, plus not editing a page (should be false)
                if (firstName != null && lastName != null && !projects[project].editing[uuid]) {
                    console.log("INSERTING")
                    let member = { firstName, lastName }
                    db.insert("USER", JSON.stringify(member), () => {
                        updateMemberList(true)
                    })
                }
            })
            /**
             * InviteMember - Adds a member to an event scouters list. 
             */
            client.on("scouters_inviteMember", ({ member, event }) => {
                if (event != "none") {
                    if (projects[project].events[event] == null) {
                        projects[project].events[event] = {}
                    }
                    if (projects[project].events[event][member] == null) {
                        projects[project].events[event][member] = false //This boolean is used to disabled/enable the removing of a user.
                    }
                    updateScoutList()
                }
            })
            /**
             * UpdateMember - The event used if a user is editing, update that member with UUID
             */
             
            client.on("scouters_updateMember", ({ firstName, lastName, member }) => {
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
                            console.log("UPDATED")
                            updateMemberList(true) //If update succesful, update member list with new name.
                        })
                    }
                }
            })
            client.on("scouters_removeMember", ({member, event}) => {
                console.log("REMVOONG")
                console.log(member)
                console.log(event)
                if (projects[project].events[event] != null) {
                    if (projects[project].events[event][member] != null) {
                        console.log("dewletesfkj")
                        delete projects[project].events[event][member]
                        updateScoutList()
                    }
                }
            })
        })
    })
})
Observo.register(null, {
    GLOBAL: {},
})