
let callEvent = new EventEmitter()
let responseEvent = new EventEmitter()
let ready = false



Observo.onMount((imports) => {
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.page.usePage(global, client, (global, client, page) => {
            let hasEvents = false
            /**
             * Check for all FRC events, if in database, lets pull them out. If not we can use tell
             * the client, that they need to wait a few seconds for all events to fetch from TBA, using
             * the TBA plugin.
             */
            let db = imports.api.database.connect(project, page, () => {
                db.isType("FRC_EVENTS", (result) => {
                    hasEvents = result
                    console.log("ATTEMPTING")
                    if (!result) {
                        console.log("doesn't have teams")
                        client.emit("events_hasTeams", { hasTeams: false })
                    } else {
                        db.fetchByType("FRC_EVENTS", (result) => {
                            client.emit("events_updateTeams", { events: JSON.parse(result[0].data) })
                        })
                    }
                })
                updateList(false)
            })
            /**
             * updateList - Update the list of events
             * @param {*} useGlobal 
             */
            let updateList = (useGlobal) => {
                db.fetchByType("EVENT", async (results) => {
                    let events = []
                    console.log(project)
                    console.log(page)
                    console.log(JSON.stringify(results))
                    console.log("FETCHED BY TYPE")
                    for (let result in results) {
                        let data = JSON.parse(results[result].data)
                        data.uuid = results[result].uuid
                        events.push(data)
                    }
                    events.sort(function (a, b) {
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(a.startDate) - new Date(b.startDate);
                    });
                    if (useGlobal) {
                        global.emit("events_listUpdate", events)
                    } else {
                        client.emit("events_listUpdate", events)
                    }
                    callEvent.emit("updateEvents", project, events)
                })
            }
            /**
             * This will update the teams IF the teams haven't been updated yet.
             * This event is sent by the client
             */
            client.on("events_updateTeams", () => {
                if (!hasEvents) {
                    hasEvents = true //Just don't allow multiple requests if two user connect at the exact same time
                    console.log("Updating Events")
                    //Fetch the data needed from PLUGIN:TBA
                    imports.plugins.tba.getEvents((new Date()).getFullYear(), (events) => {
                        db.isType("FRC_EVENTS", (result) => {
                            if (result) {
                                db.updateAll("FRC_EVENTS", JSON.stringify(events), () => {
                                    global.emit("events_updateTeams", { events })
                                })
                            } else {
                                db.insert("FRC_EVENTS", JSON.stringify(events), () => {
                                    global.emit("events_updateTeams", { events })
                                })
                            }
                        })
                    })
                }
            })
            client.on("events_addEvent", ({ name, startDate, endDate }) => {
                //TODO: Add permission
                try {
                    let event = {
                        name: name,
                        startDate: startDate,
                        endDate: endDate
                    }
                    db.insert("EVENT", JSON.stringify(event), () => {
                        updateList(true)
                    })
                } catch (e) {
                    console.log("Invalid Event??")
                }
            })
        })
    })




    //EVENTS FOR REGISTERS
    callEvent.on("getEvents", (project, callback) => {
        imports.api.database.getPagesFromProject(project, (pages) => {
            let db = imports.api.database.connect(project, pages[0].uuid, (name) => {
                db.fetchByType("EVENT", async (results) => {
                    console.log(JSON.stringify(results))
                    let events = []
                    for (let result in results) {
                        let data = JSON.parse(results[result].data)
                        data.uuid = results[result].uuid
                        events.push(data)
                    }
                    events.sort(function (a, b) {
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(a.startDate) - new Date(b.startDate);
                    });
                    console.log(events)
                    callback(events)
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
        getEvents: (name, project, callback) => {
            //Make function to call
            let main = () => {
                callEvent.emit("getEvents", project, callback)
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
        onNewEvent: (name, project, callback) => {
            callEvent.on("updateEvents", (uuid, events) => {
                if (project == uuid) {
                    callback(events)
                }
            })
        }

    },
})