Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.socket.addHandler((main, client) => {
       
    })
})
Observo.register(null, {
    GLOBAL: {},
})