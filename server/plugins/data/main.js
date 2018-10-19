Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.api.database.hasDefaultPage()
})
Observo.register(null, {
    GLOBAL: {},
})