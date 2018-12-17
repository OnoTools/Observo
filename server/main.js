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
let version = "2.0.1b"
let build = "12/16/2018@7:56"
manager.addDefined("API", "./api", true, ["API"]) //LOAD ALL API's
manager.addDefined("PLUGINS", "./plugins", false) //LOAD CUSTOM PLUGINS
manager.onAppReady((console) => {
    console.log(`$fRunning Observo ${version} built on ${build}`)
    console.log(`$2No update has been found.`)
    //cosole.log("`$eUpdate found, please update via Observo Client Server Settings`")
})