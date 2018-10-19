


Observo.onMount((imports) => {
   

    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.page.usePage(global, client, (global, client, page) => {
            let db = imports.api.database.connect(project, page, () => {
                console.log()

            })
            client.on("events_updateTeams", () => {
                imports.plugins.tba.getEvents((new Date()).getFullYear(), (events) => {
                    db.isType("FRC_EVENTS", (result) => {
                        console.log(result)
                        if (result) {
                            db.updateAll("FRC_EVENTS", JSON.stringify(events), () => {
                                global.emit("events_updateTeams", {events})
                            })
                        } else {
                            db.insert("FRC_EVENTS", JSON.stringify(events), () => {
                                global.emit("events_updateTeams", {events})
                            })
                        }
                    })
                })
            })
        })
    })
 
})
Observo.register(null, {
    GLOBAL: {},
})