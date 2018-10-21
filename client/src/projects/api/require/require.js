

let allowedRequire = [
    "react",
    "react-dom",
    "@importcore/crust",
    "@blueprintjs/core",
    "@blueprintjs/select",
    "@blueprintjs/datetime",
    "uuid/v4",
    "react-beautiful-dnd",
    "brace",
    "react-ace",
    "@convergence/ace-collab-ext",
    "moment",
    "react-big-calendar",
    "react-autosuggest", 
    "autosuggest-highlight/parse",
    "autosuggest-highlight/match"
]


Observo.register(null, {
    GLOBAL: {
        use: (name, mod) => {
            if (allowedRequire.includes(mod.toLowerCase())) {
                let a = require(mod)
                return a
            } else {
                alert(`Plugin "${name}" is requiring an illegal module:  "${mod}"`)
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