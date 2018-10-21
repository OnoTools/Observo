


Observo.onMount((imports) => {

    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.page.usePage(global, client, (global, client, page) => {
            let hasEvents = false
            let db = imports.api.database.connect(project, page, () => {
                db.isType("FRC_EVENTS", (result) => {
                    hasEvents = result
                    if (!result) {
                        client.emit("events_hasTeams", { hasTeams: false })
                    } else {
                        db.fetchByType("FRC_EVENTS", (result)=> {
                            client.emit("events_updateTeams", {events: JSON.parse(result[0].data)})
                        })
                    }
                })
            })
            client.on("events_updateTeams", () => {
                if (!hasEvents) {
                    imports.plugins.tba.getEvents((new Date()).getFullYear(), (events) => {
                        db.isType("FRC_EVENTS", (result) => {
                            console.log(result)
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
        })
    })

})
Observo.register(null, {
    GLOBAL: {},
})