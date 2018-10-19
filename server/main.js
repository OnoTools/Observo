/**
 * Observo: Server
 * @author ImportProgram
 * @copyright (C) 2018 OnoTools
 */


let DefinedManager = require("./defined.o.js")
let Babel = require("babel-core")
require("babel-polyfill");
let manager = new DefinedManager()
manager.setDefinedID("Observo") //Custom NAMESPACE
manager.setPrefix(() => {
    return "$3Observo $f| "
})
manager.transformCode((code, name) => {
    code = `//# sourceURL=${name.toUpperCase()}\n
    ${code}`

    //console.log(newCode)
    return code

})
manager.addDefined("API", "./api", true, ["API"]) //LOAD ALL API's
manager.addDefined("PLUGINS", "./plugins", false) //LOAD CUSTOM PLUGINS
manager.onAppReady((console) => {
    console.log("Attempt DB Connection..")
})