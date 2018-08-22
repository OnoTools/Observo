/**
 * Observo: Server
 * @author ImportProgram
 * @copyright (C) 2018 OnoTools
 */


let DefinedManager = require("./defined.o.js")

let manager = new DefinedManager()
manager.setDefinedID("Observo") //Custom NAMESPACE
manager.addDefined("API", "./api", true, ["API"]) //LOAD ALL API's
manager.addDefined("PLUGINS", "./plugins", false) //LOAD CUSTOM PLUGINS
manager.onAppReady((console) => {
    //Ready!
})