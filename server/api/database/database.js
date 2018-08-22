var mysql = require("mysql")
const uuidv4 = require('uuid/v4'); //Random
const md5 = require("md5")
const connect = (database = null) => {
    let data //Makes the variable here
    if (database != null) { //If no database is specified, it connects a default
        data = {
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: database
        }
    } else {
        data = {
            host: "127.0.0.1",
            user: "root",
            password: ""
        }
    }
    //Make the connection
    var con = mysql.createConnection(data);
    //Connect
    con.c
    con.connect(function (err) {
        if (err) throw err; //If error occurs, it with throw it
    });
    return con //Retsurn that connection to whatever is calling it
}
//Lazy workaround to close connection after a query
let db = (db) => {
    let data = {
        query: (sql, callback) => {
            let connection = connect(db)
            connection.query(sql, (err, result, field) => {
                callback(err, result, field)
                connection.end()
            })
        }
    }
    return data
}
let createDB = (database, callback) => {
    db().query(`CREATE DATABASE IF NOT EXISTS ${database}`, function (err, result) {
        if (err) throw err;
        callback.call()
    })
}
console.log("Connecting to Main DB")
//Plugin is ready to be used
Observo.onCustomMount((imports) => {
    console.log("Loaded Databases")
    var sql = "CREATE TABLE IF NOT EXISTS `users` ( `id` int(11) NOT NULL AUTO_INCREMENT,`uuid` varchar(100) NOT NULL,`sessionKey` varchar(100) NOT NULL,`authKey` varchar(100) NOT NULL,`username` varchar(100) NOT NULL,`password` varchar(100) NOT NULL,`role` int(11) NOT NULL,`permissions` text NOT NULL,`avatar` text NOT NULL,`color` varchar(6) NOT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=latin1";
    //Lets query the SQL for the USERS table above
    db("data").query(sql, function (err, result) {
        if (err) throw err;
    });

    var sql = "CREATE TABLE IF NOT EXISTS `projects` (`id` int(11) NOT NULL AUTO_INCREMENT, `plugins` text NOT NULL, `name` text NOT NULL,`user_uuid` varchar(100) NOT NULL,`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(),`last_edited` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(),`archived` tinyint(1) NOT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1"
    db("data").query(sql, function (err, result) {
        if (err) throw err;
    });
    let dbs = imports.api.database.API.getManager()
    console.log(JSON.stringify(dbs))
    dbs.isRole("MASTER", (response) => {
        if (!response) {
            dbs.addRole("MASTER", "red", () => {
                console.log("Added $4MASTER $frole")
            })
        }
    })
    dbs.isRole("DEFAULT", (response) => {
        if (!response) {
            dbs.addRole("DEFAULT", "cyan", () => {
                console.log("Added $3DEFAULT $frole")
            })
        }
    })
})

let handler = {}
class Database {
    constructor() {

    }
    isUser(username, callback) {
        db("data").query(`SELECT * FROM users WHERE (username="${username}")`, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        });
    }
    isUserByID(uuid, callback) {
        db("data").query(`SELECT * FROM users WHERE (uuid="${uuid}")`, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        });
    }
    /**
     * VailidateUser - Check a user based on given UUID and sessionKey
     * @param {UUID} uuid 
     * @param {UUID} sessionKey 
     * @param {Function} callback 
     */
    vailidateUser(uuid, sessionKey, callback) {
        console.log("VAILIDATING")
        db("data").query(`SELECT * FROM users WHERE (uuid="${uuid}" AND sessionKey="${sessionKey}")`, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        });
    }
    /**
     * SignInViaAuth - Signs in user via an AUTH KEY
     * @param {String} authkey 
     * @param {Function} callback 
     */
    signInViaKey(authKey, sessionKey, callback) {
        let me = this
        if (authKey != null) {
            db("data").query(`SELECT * FROM users WHERE (authKey="${authKey}")`, function (err, results, fields) {
                if (err) console.log(err)
                if (results.length > 0) {
                    me.updateSessionKey(sessionKey, results[0].uuid)
                    //let authKey = me.newAuthKey(results[0].uuid)

                    let response = {}
                    response.authKey = authKey
                    response.uuid = results[0].uuid
                    callback(response)
                } else {
                    callback(null)
                }
            })
        }
    }

    /**
     * SignIn - Signs ina user with its USERNAME, PASSWORD (and SESSION KEY)
     * 
     * @param {String} username 
     * @param {String} password 
     * @param {UUID} sessionKey 
     * @param {Function} callback 
     */
    signIn(username, password, sessionKey, callback) {
        let me = this
        password = md5(password)
        db("data").query(`SELECT * FROM users WHERE (username="${username}") AND (password="${password}") `, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                me.updateSessionKey(sessionKey, results[0].uuid)
                let authKey = me.newAuthKey(results[0].uuid)

                let response = {}
                response.authKey = authKey
                response.uuid = results[0].uuid
                callback(response)
            } else {
                callback(null)
            }
        })

    }
    /**
     * AddUser - Adds a user to the database
     * @param {String} username 
     * @param {String} password 
     * @param {UUID} sessionKey 
     */
    addUser(username, password, sessionKey) {
        let uuid = uuidv4() //Get a UUID
        password = md5(password)
        let query = `INSERT INTO users (id, uuid, sessionKey, authKey, username, password, role, permissions, avatar, color) VALUES (NULL, '${uuid}', '${sessionKey}', '-', '${username}', '${password}', '0', '-', '-', 'black')`
        console.log(query)
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
        })
        let authKey = this.newAuthKey(uuid)
        return authKey
    }
    getUser(uuid, callback) {
        db("data").query(`SELECT * FROM users WHERE (uuid="${uuid}")`, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(results[0])
            } else {
                callback(null)
            }
        });
    }
    /**
     * UpdateSessionKey - Updates the sessionKey of a user based on the UUID
     * @param {UUID} sessionKey 
     * @param {UUID} uuid 
     */
    updateSessionKey(sessionKey, uuid) {
        let query = `UPDATE users SET sessionKey = '${sessionKey}' WHERE uuid = '${uuid}'`
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
        })
    }
    /**
     * NewAuthKey - Generates a brand new authKey for a user based on the UUID
     * @param {UUID} uuid 
     */
    newAuthKey(uuid) {
        let authKey = uuidv4();
        let query = `UPDATE users SET authKey = '${authKey}' WHERE uuid = '${uuid}'`
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
        })
        return authKey
    }
    /**
     * TODO: Redo Role System
     * @param {UUID} uuid 
     * @param {String} role 
     * @param {Function} callback 
     */
    hasRole(uuid, role, callback) {
        let authKey = uuidv4();
        let query = `SELECT * FROM users WHERE (uuid="${uuid}")`
        console.log(query)
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                if (results[0].role >= role) {
                    callback(true)
                } else if (results[0].role == "-1") {
                    callback(true)
                } else {
                    callback(false)
                }
            } else {
                callback(false)
            }
        })
    }
    isRole(name, callback) {
        let query = `SELECT * FROM roles WHERE (name="${name}")`

        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        })
    }
    addRole(name, color, callback) {
        let uuid = uuidv4();
        let query = `INSERT INTO roles (uuid, name, color, permissions) VALUES ('${uuid}', '${name}', '${color}', '{}')`
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            callback()
        })
    }
    getRoles(callback) {
        let query = `SELECT * FROM roles`
        console.log(query)
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(results)
            } else {
                callback(null)
            }
        })
    }
    /**
     * GetNameByUUID - Gets a users "name" based on the UUID
     * @param {UUID} uuid 
     * @param {Function} callback 
     */
    getNameByUUID(uuid, callback) {
        db("data").query(`SELECT * FROM users WHERE (uuid="${uuid}")`, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                console.print(results)
                callback(results[0].username)
            } else {
                callback(null)
            }
        })
    }
    /**
     * ListProjects - Lists all projects on the SERVER
     * @param {Function} callback 
     */
    listProjects(callback) {
        let query = `SELECT * FROM projects`
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(results)
            } else {
                callback(null)
            }
        })
    }
    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                      PROJECT DATABASES ONLY                         //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    isProject(projectName, callback) {
        let query = `SELECT * FROM projects WHERE (name="${projectName}")`
        db("data").query(query, function (err, results, fields) {
            if (err) console.log(err)
            if (results.length > 0) {
                callback(true)
            } else {
                callback(false)
            }
        })
    }
    getProject(projectName, callback) {
        this.isProject(projectName, () => {
            console.log("is project")
            console.log(projectName)
            let query = `SELECT * FROM projects WHERE (name="${projectName}")`
            db("data").query(query, function (err, results, fields) {
                if (err) console.log(err)
                console.log("here")
                console.log(JSON.stringify(results))
                if (results.length > 0) {
                    console.log("data send")
                    callback(results[0])
                } else {
                    callback(null)
                }
            })
        })
    }
    addProject(projectName, uuid, preset, callback) {
        //Check first if this project name is avalable
        projectName = projectName.replace(/[^a-zA-Z ]/g, "")
        this.isProject(projectName, (state) => {
            if (!state) {
                let query = `INSERT INTO projects (plugins, name, user_uuid, created, last_edited, archived) VALUES ('${plugins}', '${projectName}', '${uuid}', CURRENT_TIME(), CURRENT_TIME(), '0')`
                console.log(query)
                this.sql.query(query, function (err, results, fields) {
                    if (err) console.log(err)
                })
                let replaceAll = function (str, find, replace) {
                    return str.replace(new RegExp(find, 'g'), replace);
                }
                //Convert project name to database safe name, when its created
                let id = projectName.toLowerCase()
                id = id.replace(/[^a-zA-Z ]/g, "")

                //Create the new database for the project
                createDB(`_${id}`, () => {
                    callback(true)
                })
            } else {
                callback(false)
            }
        })
    }

}
let manager = new Database();
Observo.register(null, {
    GLOBAL: {
        load(projectName) {

        }
    },
    API: {
        getManager() {
            return manager;
        }
    }
})