

let allowedRequire = [
    "xmlhttprequest"
]


Observo.register(null, {
    GLOBAL: {
        use: (name, mod) => {
            if (allowedRequire.includes(mod.toLowerCase())) {
                let a = require(mod)
                return a
            } else {
                console.log(`Plugin "${name}" is requiring an illegal module:  "${mod}"`)
            }
            return null
        }
    },
    API: {
        getPage: (name) => {
            return loaded.renderPage(name)
        }
    }
})