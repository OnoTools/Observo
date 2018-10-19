
let localEvents = new EventEmitter()
let pages = {}
Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.database.getPageByProject(project, "entry", (list) => {
            console.log(JSON.stringify(list))
        })
        imports.api.page.usePage(global, client, (global, client, page) => {
            let db = imports.api.database.connect(project, page, () => {
                db.hasDefaultPage()
            })
        })
    })
})
Observo.register(null, {
    GLOBAL: {
        
    },
})