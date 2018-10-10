Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.socket.addHandler((main, client) => {
       
    })
    require("cheese")
})
Observo.register(null, {
    GLOBAL: {},
})