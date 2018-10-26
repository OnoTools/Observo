/** 
 * defined.js 
 * --------
 * A simple lib (7k, requires AMD loader) to define code as a API or Plugin and run it async without worrying about require issue
 * @author ImportProgram
 */


require("amd-loader");
//var { transform } = require("babel-core");
var EventEmitter = require('events').EventEmitter;
const startTime = process.hrtime()
class Logging {
    constructor() {
        this.prefix = this.color("$3 Observo $f|")
    }
    /**
     * Color - Colors text using $ as the break point followed by a color code
     * @param {*} data 
     */
    color(data) {
        let paint = (color, text) => {
            switch (color) {
                case '0'://black
                    text = '' + text; break;
                case '4': //red
                    text = '' + text; break;
                case '2': //green
                    text = '' + text; break;
                case 'E': //yellow
                    text = '' + text; break;
                case '1': //blue
                    text = '' + text; break;
                case 'D': //magenta
                    text = '' + text; break;
                case '3': //cyan
                    text = '' + text; break;
                case 'f': //white
                    text = '' + text; break;
                default:
                    text = color + text; break;
            }
            return text
        }
        let output = ""
        let painting = false
        let grabColor = 0
        let color = ""
        let items = []
        //Loop throw the string
        for (var i = 0; i < data.length; i++) {
            //If DOLLAR SIGN is found, stop adding CHARACTER to OUTPUT string
            if (data[i] == "$") {
                if (painting) {
                    //If paiting is true either here or down below, add the output to an array and clear output, also check for no output
                    if (output != "") {
                        items.push(paint(color, output))
                        painting = false
                        output = ""
                    }
                }
                //This will enable the color grabber
                grabColor = true
                color = ""
            }
            //When this is enabled it will let the loop go over TWO CHARACTERS to grab color code (hi$a)
            if (grabColor) {
                color = color + data[i]
                if (color.length == 2) {
                    grabColor = false
                    painting = true
                    //Remove the dollar sign cause its not needed, make PAITING TRUE
                    color = color.replace("$", "")
                }
            } else {
                output = output + data[i]
            }
        }
        //If paiting is true either here or above add the output to an array and clear output
        if (painting) {
            items.push(paint(color, output))
        }
        output = ""
        for (let i in items) {
            output = output + items[i]
        }
        return output
    }
    log(message) {
        message = `${this.prefix} ${this.color(`$2${message}`)}`
        console.log(message)
    }
    info(message) {
        message = `${this.prefix} ${this.color(`$3${message}`)}`
        console.log(message)

    }
    error(message) {
        message = `${this.prefix} ${this.colorText("red", message)}`
        console.log(message)
    }
}
const log = new Logging()
/**
 * Gets a list of files in a folder, can be infinite too.
 * - In this particular code, its package.json though
 * @param {String} dir 
 * @param {Recursive String} filelist 
 */
const getPackages = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getPackages(path.join(dir, file), filelist);
        }
        else {
            if (file == "package.json") {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};
//Splits at a location, 
const splitAt = index => x => [x.slice(0, index), x.slice(index)]

var self //Global this of the class below
class Manager extends EventEmitter {
    constructor() {
        super()
        self = this
        self.id = "defined"
        this.defined = {}
        this.pass = false
        this.moduleList = []
        this.transform = (c, n) => {return `//# sourceURL=${n.toUpperCase()}\n${c}`}
    }
    /**
     * SetDefinedID - Sets the DEFINED namespace used in a plugin/api
     * @param {*} id 
     */
    setDefinedID(id) {
        this.id = id
    }
    /**
     * AppReady - When the app is ready, called when all modules have been loaded
     * @param {Function} callback 
     */
    appReady(callback) {
        this.on('app-ready', () => {
            log.info("Succesfully loaded in: $f" + ((process.hrtime(startTime)[0] * 1000) + (process.hrtime(startTime)[1] / 1000000)).toFixed(3) + "ms")
            callback(log)
        });
    }
    /**
     * AddDefined - Add a "defined" directory to load as a namespace
     * @param {String} section 
     * @param {String} path 
     * @param {Boolean} allowRequire 
     * @param {ArrayList} customRegisters 
     */
    addDefined(section, path, allowRequire, customRegisters) {
        section = section.toLowerCase()
        if (self.defined[section] == null) {
            self.defined[section] = {}
            self.defined[section].__customRegisters = customRegisters
            //Loop through directory given (path)
            let root = require("path").join(__dirname, path)
            let apis = getPackages(root)
            //For loop all pacakges found
            for (let file in apis) {
                let f = apis[file]
                //Use AMD-LOADER for async module loading (faster)
                define(function (require, exports, module) {
                    f = f.replace(/\\/g, "/");
                    let json = require(f) //Load the package.json
                    if (json.name && json.version) {
                        if (!self.defined[section][json.name]) {
                            //Creat the new module
                            self.defined[section][json.name] = {}
                            self.defined[section][json.name].package = json
                            self.defined[section][json.name].registered = false
                            self.defined[section][json.name].services = {}
                            let dir = splitAt(f.lastIndexOf("/"))(f)[0]
                            if (json.main) {
                                self.moduleList.push(json.name)
                                let main = dir + "/" + json.main
                                //Load the module (but do it as TEXT not as a require)
                                require('fs').readFile(main, 'utf8', (err, data) => {
                                    if (err) { console.log("[Defined] Cannot load " + json.main + "!") }
                                    else {self.run(data, section, json.name, allowRequire)}
                                });
                            } else {
                                console.log("[Loader] Has no 'main' file?")
                            }
                        }
                    }

                });

            }
            return self.defined[section]
        }
    }
    /**
     * Run - runs code from the module, with some magic
     * @param {String} code 
     * @param {String} section 
     * @param {String} name 
     * @param {Boolean} allowRequire 
     */
    run(code, section, name, allowRequire) {
        //Custom Console to pass onto a MODULE
        let customConsole = {
            log: (message) => {
                log.log(`[${section.toUpperCase()}][${name.toUpperCase()}] ${log.color(`$f${message}`)}`)
            },
            info: (message) => {
                log.info(`[${section.toUpperCase()}][${name.toUpperCase()}] ${log.color(`$3${message}`)}`)
            },
            error: (message) => {
                log.error(`[${section.toUpperCase()}][${name.toUpperCase()}] ${log.color(`$4${message}`)}`)
            }
        }
        let customRequire = (module) => { customConsole.error(`REQURING of '${module}' is not allowed`) }
        if (allowRequire) {
            customRequire = require
        }
        //ALL BELOW ARE DEFINED VARAIBLES WHICH NEED CLEARING (setting to null)
        var indexedDB = null;
        var location = null;
        var navigator = null;
        var onerror = null;
        var onmessage = null;
        var performance = null;
        var self = null;
        var webkitIndexedDB = null;
        var postMessage = null;
        var close = null;
        var openDatabase = null;
        var openDatabaseSync = null;
        var webkitRequestFileSystem = null;
        var webkitRequestFileSystemSync = null;
        var webkitResolveLocalFileSystemSyncURL = null;
        var webkitResolveLocalFileSystemURL = null;
        var addEventListener = null;
        var dispatchEvent = null;
        var removeEventListener = null;
        var dump = null;
        var onoffline = null;
        var ononline = null;
        var importScripts = null;
        var application = null;
        let global = null
        let process = null
        let exports = null
        let __dirname = null
        let __filename = null
        let run = null

        //Defined Object
        let defined = {
            //Register a MODULE
            register: (id, services) => {
                this.defined[section][name].services = services
                this.defined[section][name].registered = true

                this.checkMounting()
            },
            //BUILD A CUSTOM MOUNT
            onCustomMount: (callback) => {
                this.on('mount-custom', () => {
                    let data = this.getCustomServices(section, name)
                    callback(data)
                });
            },
            //BUILT A NORMAL MOUNT (with callback naming)
            onMount: (callback) => {
                /*const nameFunction = function (fn, name) {
                    return Object.defineProperty(fn, 'name', { value: name, configurable: true });
                };*/
                this.on('mount-imports', () => {
                    let data = this.getGlobalServices(section, name)
                    //callback = nameFunction(callback, name)
                    callback(data)
                });
            },
            //GET ALL DEFINED PACKAGE (can be use for settings, etc)
            getDefined: () => {
                let local = {}
                for (let _section in this.defined) { //Loop them
                    local[_section] = {} //Get object of module 
                    for (let _name in this.defined[_section]) {
                        if (_name != "__customRegisters") { //Check to see if __customRegisters was for loop, if so ignore it
                            local[_section][_name] = {}
                            local[_section][_name].package = this.defined[_section][_name].package
                        }
                    }
                }
                return local
            }
        }
        //Grab the GLOBAL ID (whatever has be set), and use it as the MODULE NAMSPACE (keep in mind the word "defined" will still work anywhere)
        let id = this.id
        let newCode = `module.exports = function(require, console, ${id}, log) { ${code} }`;
        self = null
        newCode = this.transform(newCode, name)
        let launchCode = eval(newCode);
        //Run the code
        launchCode(customRequire, console, defined, null);
    }
    /**
     * CheckMounting - Checks to see if all plugins have mounted registers
     */
    checkMounting() {
        let pass = true
        for (let section in this.defined) {
            for (let mod in this.defined[section]) {
                try {
                    if (this.defined[section][mod].registered == false) {
                        pass = false
                    }
                } catch (e) { }
            }
        }
        if (pass && !this.pass) {
            this.pass = true
            let z = ""
            for (let m in this.moduleList) {
                z = `${z}${ this.moduleList[m].toUpperCase()} `
            }
            log.log(`$DLoading ( ${z})`)
            this.emit('mount-imports'); //Mount all GLOBAL imports
            this.emit('mount-custom'); //Mount any CUSTOM imports
            this.emit('app-ready') //Mount the AppReady event.
        }
    }
    /**
     * GetGlobalServices - Gets all services under then GLOBAL namespace when registering an module.
     * @param {String} section 
     * @param {String} name 
     * @return {ArrayList} services
     */
    getGlobalServices(section, name) {
        if (this.defined[section][name].package.consumes) {
            let consumes = this.defined[section][name].package.consumes
            let imports = {}
            for (let value in consumes) {
                let mod = consumes[value].split(":")
                let _section = mod[0]
                let _name = mod[1]
                if (this.defined[_section]) {
                    if (imports[_section] == null) {
                        imports[_section] = {}
                    }
                    if (this.defined[_section][_name]) {
                        let local = {}
                        let me = this
                        for (let service in this.defined[_section][_name].services.GLOBAL)  {
                            local[service] = function () {
                                var args = Array.prototype.slice.call(arguments);
                                args.unshift(name);
                                let a = me.defined[_section][_name].services.GLOBAL[service].apply(this, args);
                                if (a) {
                                    return a
                                }
                            }
                        }
                        imports[_section][_name] = local
                    }
                }
            }
            return imports
        }
        return null
    }
    /**
     * GetCustomServices - Gets all custom services that are specified under a namespace when registering an module.
     * @param {String} section 
     * @param {String} name 
     * @return {ArrayList} services
     */
    getCustomServices(section, name) {
        if (this.defined[section][name].package.consumes) { //Check if the module consumes, defined in package.json
            let customImports = {} //Object of imports
            let customRegisters = this.defined[section].__customRegisters //Check when registers namespaces it needs
            for (let _section in this.defined) { //Loop them
                customImports[_section] = {} //Get object of module 
                for (let _name in this.defined[_section]) {
                    if (_name != "__customRegisters") { //Check to see if __customRegisters was for loop, if so ignore it
                        customImports[_section][_name] = {}
                        for (let register in customRegisters) {
                            let id = customRegisters[register]
                            try {
                                customImports[_section][_name][id] = this.defined[_section][_name].services[id]
                            } catch (e) {
                                console.log("[DML] Doesn't Support Custom Register (" + _section + ":" + _name + ")")
                            }
                        }
                    }

                }
            }
            return customImports
        }
        return null
    }
    transformCode(callback) {
        this.transform = callback
    }
}

let m = new Manager()

function PluginManager() { }
PluginManager.prototype.addDefined = function (id, path, allowRequire = null, customRegisters) { return m.addDefined.call(this, id, path, allowRequire, customRegisters); }
PluginManager.prototype.onAppReady = function (callback) { m.appReady(callback) }
PluginManager.prototype.mountAll = function () { m.checkMounting() }
PluginManager.prototype.transformCode = function (code) { m.transformCode(code)}
PluginManager.prototype.setDefinedID = function (id) { m.setDefinedID(id) }
module.exports = PluginManager;