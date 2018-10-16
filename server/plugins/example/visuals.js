Observo.onMount((imports) => {
    console.log("MOUNTED")
    imports.plugins.entry.onEntry(() => {
        console.log("ON ENTRY")
    })
})
Observo.register(null, {
    GLOBAL: {},
})