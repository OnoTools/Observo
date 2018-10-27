
let projects = {}
let clients = {}
/**
 * Scheduler Plugin 
 * - Has list of all members, and a list for whom is at an event.
 * 
 * Socket Info
 *   [SERVER]             [CLIENT]
 * EVENT
 * - scheduler_eventList --> List of all events
 * - scheduler_selectEvent <-- User Selects an Event
 * - scheduler_populateMembers --> When the server grabs the list of scouter for that event. (Grab all team members too)
 * EDITOR
 * - scheduler_editor_updateEverything --> Like it says. UPDATE EVERYTHING
 * - scheduler_editor_addStaticColumn <-- Adds a static column with no allowed professions. Each one can be type in or be the same.
 *          - EX: 8:30 Opening Ceremonies - Everyone to stands --------- It can be added at beginning or end
 * - scheduler_editor_selectUnitOfProgress <-- What unit of progress wil be used? (Time Intervals or Match Intervals?)
 * - scheduler_editor_setIntervals <-- The Intervals (so ex: 16 matches or 30 mins)
 * - scheduler_editor_setLimit <-- The time/match of start and time/match of end.
 *          - EX: Match 0 to Match 80. 
 *          - EX  @8:30 to @4:40
 * - scheduler_editor_build <-- The event to tell the server to do its magic and find a good schedule.
 * - scheudler_editor_buildProgress --> Event to tell client how many 90%+ probable outcomes are to bee used.
 * - scheduler_editor_buildList --> The list of all possible (90% outcomes, limit 5) that have been found. Can take a while
 * - scheduler_editor_useProfession <-- What profession is the user gonna add to the Scouters?
 * - scheduler_editor_addProfession <-- Adds a profession tag to a Scouter. Will be X color to show it was manually forced.
 * - scheduler_editor_removeProfession <-- Removes profession from select column and row that a scouter is located. 
 * PROFESSION SYSTEM
 * - scheduler_professions_updateList --> Updates the list of professions
 * - scheduler_professions_add <--  Adds a user to the profession list
 * - scheduler_professions_editing <-->  Client tells the server there editing a profession. Server responds with global emit of to all conencted clients
 * - scheduler_professions_rename <-- Renames a profession. User must be editing
 * - scheduler_professions_remove <-- Removes a profession. No User can be editing
 * RULES
 * - scheduler_rule_updateList --> scheduler_rule_updateList: SEND TO CLIENT
 * - scheduler_rule_add <--  Adds a rule defined by user
 * - scheduler_rule_editing <-->  Allows editing of a rule
 * - scheduler_rule_update <-- Updates a role that the user requested
 * - scheduler_rule_remove <-- Removes a role 
 */
Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.page.usePage(global, client, (global, client, page) => {
            //START
            if (projects[project] == null) {
                projects[project] = {}
                clients[project] = {}
                clients[project].socket = {}
                projects[project].fetchedEvents = null
                projects[project].fetchedMembers = null
                projects[project].profession = {}
                projects[project].profession.list = {}
                projects[project].profession.editing = {}

                projects[project].editor = {}
                projects[project].editSettings = {}
                projects[project].settings = {}

                projects[project].selectedEvent = {}
                projects[project].selectedDay = {}
            }
            clients[project].socket[uuid] = client
            //Connect to the database. Use it as the "on ready for the user"
            let db = imports.api.database.connect(project, page, () => {
                updateProfessionList(false)
                updateProfessionEditList(false)

                //updateEditorSettings(false)
                //updateEditorTable(false)

            })
            //Check if events can be used from plugins:events. Only check once per project, then just store it in a variable. Saves database query attempts.
            if (projects[project].fetchedEvents == null) {
                imports.plugins.events.getEvents(project, (events) => {
                    //Convert it to a proper object
                    let data = {}
                    for (let e in events) {
                        let event = events[e]
                        data[event.uuid] = { name: event.name, startDate: event.startDate, endDate: event.endDate }
                    }
                    projects[project].fetchedEvents = data
                    client.emit("scheduler_eventList", data)
                })
                //Check if new events are added to PLUGINS:events, this only needs to be made once per project instance. 
                imports.plugins.events.onNewEvent(project, (events) => {
                    //Convert it to a proper object
                    let data = {}
                    for (let e in events) {
                        let event = events[e]
                        data[event.uuid] = { name: event.name, startDate: event.startDate, endDate: event.endDate }
                    }
                    projects[project].fetchedEvents = data
                    client.emit("scheduler_eventList", data)
                })
            } else {
                //Pull from ram.
                let data = projects[project].fetchedEvents
                client.emit("scheduler_eventList", data)
            }

            //Members List
            if (projects[project].fetchedMembers == null) {
                imports.plugins.team.getMembers(project, (members) => {
                    projects[project].fetchedMembers = members
                    client.emit("scheduler_memberList", members)
                })
                //TODO: Add On Event for the members
            } else {
                let members = projects[project].fetchedMembers
                client.emit("scheduler_memberList", members)
            }




            //PROFESSIONS

            let updateProfessionList = (useGlobal) => {
                db.fetchByType("PROFESSION", async (results) => {
                    let professions = []
                    for (let result in results) {
                        let data = JSON.parse(results[result].data)
                        data.uuid = results[result].uuid
                        professions.push(data)
                    }
                    professions.sort(function (a, b) {
                        var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                        if (nameA < nameB) //sort string ascending
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    });
                    if (useGlobal) {
                        global.emit("scheduler_professions_updateList", professions)
                    } else {
                        client.emit("scheduler_professions_updateList", professions)
                    }
                })
            }
            let updateProfessionEditList = (useGlobal) => {
                if (useGlobal) {
                    global.emit("scheduler_professions_editing", { editors: projects[project].profession.editing })
                } else {
                    client.emit("scheduler_professions_editing", { editors: projects[project].profession.editing })
                }
            }
            //Update list if client asked for it.
            client.on("scheduler_professions_updateList", () => {
                updateProfessionList(false)
            })
            client.on("scheduler_professions_editing", (data) => {
                console.log("YESHshsHSH")
                //Check if the memeber id is nonething, if so the user don't want to edit no more
                if (data.uuid == false) {
                    client.emit("scheduler_professions_stopEditing")
                    projects[project].profession.editing[uuid] = false //Remove the user from the list (making them not edit anything)
                    updateProfessionEditList(true) //Update the edit list
                } else {
                    //If they want to editing something, first lets check if someone else is editing them.
                    let pass = true
                    for (let u in projects[project].profession.editing) {
                        let nameUUID = projects[project].profession.editing[u]
                        if (nameUUID == data.uuid) {
                            pass = false
                        }
                    }
                    //If no one editing that member on the team, let them edit it, also update the listr
                    if (pass) {
                        projects[project].profession.editing[uuid] = data.uuid
                        client.emit("scheduler_professions_isEditing", { profession: data.uuid })
                        updateProfessionEditList(true)
                    }
                }
            })
            client.on("scheduler_professions_add", ({ name, binded }) => {
                //Check if they have a first and last name, plus not editing a page (should be false)
                if (name != null && binded != null) {
                    let data = { name, binded }
                    db.insert("PROFESSION", JSON.stringify(data), () => {
                        updateProfessionList(true)
                    })
                }
            })



            client.on("scheduler_professions_update", ({ name, binded, profession }) => {
                //Check if a user is actually editing a member.
                let pass = false
                for (let u in projects[project].profession.editing) {
                    let nameUUID = projects[project].profession.editing[u]
                    //TODO: check if this user (uuid is u)
                    if (nameUUID == profession) {
                        pass = true
                    }
                }
                //If someone is at least editing the member, go along and update it
                if (pass) {
                    if (name != null && binded != null) {
                        let data = { name, binded }
                        db.update(profession, JSON.stringify(data), () => {
                            console.log("UPDATED")
                            updateProfessionList(true) //If update successful, update member list with new name.
                        })
                    }
                }
            })





            let updateEditorTable = (useGlobal) => {
                if (useGlobal) {
                    let event = projects[project].selectedEvent[uuid]
                    let day = projects[project].selectedDay[uuid]
                    let editor = projects[project].editor[event][day]
                    let settings = projects[project].settings[event][day]
                    let isEditingSettings = projects[project].editSettings[event][day]
                    //Loop through all clients, as we can't use global rn
                    for (let c in clients[project].socket)
                        //Check if this client has select a proper event (none by default, so they SHOULD)
                        if (projects[project].selectedEvent[c] == event && projects[project].selectedDay[c] == day) {
                            //If so grab the client in the variable
                            let _client = clients[project].socket[c]
                            //Send the data to THAT client only (repeat if more client are on the same event and day)
                            _client.emit("scheduler_editor_updateEditor", { editor })
                            _client.emit("scheduler_editor_updateSettings", { settings, isEditingSettings })
                        }
                } else {
                    let event = projects[project].selectedEvent[uuid]
                    let day = projects[project].selectedDay[uuid]
                    let editor = projects[project].editor[event][day]
                    let settings = projects[project].settings[event][day]
                    let isEditingSettings = projects[project].editSettings[event][day]

                    client.emit("scheduler_editor_updateEditor", { editor })
                    client.emit("scheduler_editor_updateSettings", { settings, isEditingSettings })
                }
            }


            /**
             * SelectEvent - What Event A User Selects and the day of that event
             */
            client.on("scheduler_editor_selectEvent", ({ event, day }) => {
                //TODO: Check if this is a real event?
                //TODO: Check if its a real day for this event
                if (projects[project].selectedEvent[uuid] == null) {
                    projects[project].selectedEvent[uuid] = {}
                }
                //Check if event has been used
                if (projects[project].editor[event] == null) {
                    projects[project].editor[event] = {}
                    projects[project].editSettings[event] = {}
                    projects[project].settings[event] = {}
                }
                //Check if DAY for that EVENT has been used
                if (projects[project].editor[event][day] == null) {
                    projects[project].editor[event][day] = {}
                    projects[project].editor[event][day].members = {}
                    console.log(event)
                    console.log(day)
                    projects[project].editSettings[event][day] = false
                    projects[project].settings[event][day] = {
                        unit: "match", //time
                        interval: 16, //30
                        start: 0, //8|30
                        end: 80  //4|30
                    }
                    for (let m in projects[project].fetchedMembers) {
                        let member = projects[project].fetchedMembers[m]
                        projects[project].editor[event][day].members[member.uuid] = {}
                        projects[project].editor[event][day].members[member.uuid].hide = false
                        //projects[project].editor[event][day].outcome[0...].startColumns[] //Used for: Open Ceromnies, be in stands at 8:30, etc. Only text
                        //projects[project].editor[event][day].outcome[0...].progressColumns[] //Base SYSTEM, for matchs and time. Only professions. Dynamically created based on SETTINGS for event and day. Rules are for the entire event
                        //projects[project].editor[event][day].outcome[0...].endColumns[] //Used for: Clean up column.  Only text
                        console.log("im here")
                    }
                }
                projects[project].selectedEvent[uuid] = event
                projects[project].selectedDay[uuid] = day
                updateEditorTable(false)

                console.log(JSON.stringify(projects))
            })
            client.on("scheduler_editor_hideMember", ({ member }) => {
                console.log("YES WE HDING UT")
                let event = projects[project].selectedEvent[uuid]
                let day = projects[project].selectedDay[uuid]
                if (projects[project].editor[event][day].members[member.uuid].hide == false) {
                    projects[project].editor[event][day].members[member.uuid].hide = true
                } else {
                    projects[project].editor[event][day].members[member.uuid].hide = false
                }
                updateEditorTable(true)
            })
            client.on("scheduler_editor_updateSettings", ({ type, value }) => {
                let event = projects[project].selectedEvent[uuid]
                let day = projects[project].selectedDay[uuid]
                if (type == "unit" || type == "interval" || type == "start" || type == "end") {
                    if (type == "start" || type == "end" || type == "interval") {
                        if (value < 0) {
                            value = 0
                        }
                    }
                    projects[project].settings[event][day][type] = value
                }
                updateEditorTable(true)
            })

            client.on("scheduler_editor_editingSettings", () => {
                let event = projects[project].selectedEvent[uuid]
                let day = projects[project].selectedDay[uuid]
                try {
                    if (projects[project].editSettings[event][day] == false) {
                        console.log("HERE!")
                        projects[project].editSettings[event][day] = uuid
                        updateEditorTable(true)
                    } else {
                        console.log("HERE!!")
                        if (projects[project].editSettings[event][day] == uuid) {
                            projects[project].editSettings[event][day] = false
                            updateEditorTable(true)
                            console.log("HERE!!!")
                        }
                    }
                } catch (e) {
                    console.log(e)
                    console.log("Didn't select an event")
                }
            })
        })
    })
})
Observo.register(null, {
    GLOBAL: {},
})