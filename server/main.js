let plugin = require("./defined").PluginManager

let manager = new plugin()
manager.setDefinedID("Observo")
manager.addDefined("API", "./api", true)
manager.addDefined("PLUGINS", "./plugins", false)
manager.onAppReady((console) => {
    
})