
let localEvents = new EventEmitter()
let pages = {}
Observo.onMount((imports) => {
    imports.api.database.getPagesFromProject("ae78bth37-ad38-770f-96ec-a1621edb3c7d", "entry", (list) => {
        console.log(JSON.stringify(list))
    })
    imports.api.socket.addHandler((global, client, uuid, project) => {
        imports.api.database.getPageByProject(project, "entry", (list) => {
            console.log(JSON.stringify(list))
        })
        imports.api.page.usePage(global, client, (global, client, page) => {
            let db = imports.api.database.connect(project, page, () => {
                
            })
        })
    })
})
Observo.register(null, {
    GLOBAL: {
        
    },
})