
let callEvent = new EventEmitter()
let responseEvent = new EventEmitter()
let ready = false
Observo.onMount((imports) => {
    let require = imports.api.require.use
    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

    class BlueAlliance {
        /**
         * @constructor
         * @param {String} authkey - Your X-TBA-Auth-Key from TheBlueAlliance.
         */
        constructor(authkey) {
            this.authkey = authkey;
            this.status = "Unknown";
        }

        // TBA FUNCTIONS

        async callTBA(request) {
            var authkey = this.authkey;

            if (request !== "/status") { this.status = await this.callTBA("/status") }
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function () { if (this.readyState === 4) resolve(JSON.parse(this.responseText)) }

                xhr.open("GET", "https://www.thebluealliance.com/api/v3" + request);
                xhr.setRequestHeader("X-TBA-Auth-Key", authkey);
                xhr.send();
            });
        }

        async getStatus() {
            return await this.callTBA("/status");
        }


        async getTeams(page_num) {
            return await this.callTBA(`/teams/${page_num}/simple`)
        }
        // BASE FUNCTIONS

        /**
         * Base function - Gives team information about a team.
         * @param {Int|String} teamnum - The FIRST team number of the team.
         * @returns {Promise<Object>} A promise containing a team object representing the team.
         * @async
         */
        async getTeam(teamnum) {
            var teamkey = "frc" + teamnum;
            return await this.callTBA("/team/" + teamkey);
        }

        /**
         * Base function - Gives information about an event.
         * @param {Int|String} eventcode - The 4 letter code for the event as specified on https://frc-events.firstinspires.org/2018/.
         * @param {Int|String} [year] - The 4 digit year of the event.
         * @returns {Promise<Object>} A promise containing an event object representing the event.
         * @async
         */
        async getEvent(eventcode, year) {
            var eventkey = year + eventcode.toString().toLowerCase();
            return await this.callTBA("/event/" + eventkey);
        }

        async getEvents(year) {
            return await this.callTBA(`/events/${year}/simple`)
        }


        /**
         * Base function - Gives information about a match.
         * @param {Object} event - The event that the match takes place at.
         * @param {String} complevel - The level of play of the match (q, ef, qf, sf, f) (qualifications, eliminations, quarter finals, semi-finals, finals)
         * @param {Int} matchnum - The number of the match in the competition level.
         * @param {Int} seminum - The number of the match in the match set.
         * @returns {Promise<Object>} A promise containing a match object representing a match.
         * @async
         */
        async getMatch(event, complevel, matchnum, seminum) {
            if (!seminum) seminum = "";
            var matchkey = event.year + event.event_code + "_" + complevel + seminum + "m" + matchnum;
            return await this.callTBA("/match/" + matchkey);
        }

        // TEAM FUNCTIONS

        /**
         * Gives information on the rewards that a team has earned.
         * @param {Object} team - A team.
         * @returns {Promise<Object[]>} A promise containing an array of rewards that the team has recieved.
         * @async
         */
        async getTeamAwards(team) {
            var teamkey = team.key;
            return await this.callTBA("/team/" + teamkey + "/awards")
        }

        /**
         * Gives the events that a team has or will attend.
         * @param {Object} team - A team.
         * @returns {Promise<Object[]>} A promise containing the events the team has or will attend.
         * @async
         */
        async getEventsForTeam(team) {
            var teamkey = team.key;
            return await this.callTBA("/team/" + teamkey + "/events");
        }

        // EVENT FUNCTIONS

        /**
         * Gives the teams at an event.
         * @param {Object} event - An event.
         * @returns {Promise<Object[]>} A promise containing an array of teams that are at the event.
         * @async
         */
        async getTeamsAtEvent(event) {
            var eventkey = event.key;
            return await this.callTBA("/event/" + eventkey + "/teams");
        }

        /**
         * Gives the matches at an event.
         * @param {Object} match - A match.
         * @returns {Promise<Object[]>} A promise containing an array of matches at the event.
         * @async
         */
        async getMatchesAtEvent(event) {
            var eventkey = event.key;
            return await this.callTBA("/event/" + eventkey + "/matches");
        }

        /**
         * Generates the stream link for an event.
         * @param {Object} event - An event.
         * @returns {String} A link to the event's stream or webcast.
         */
        getEventStreamLink(event) {
            if (event.webcasts.length > 0) {
                if (event.webcasts[event.webcasts.length - 1].type === "ustream") { return "http://www.ustream.tv/channel/" + event.webcasts[event.webcasts.length - 1].channel }
                else if (event.webcasts[event.webcasts.length - 1].type === "twitch") { return "https://twitch.tv/" + event.webcasts[event.webcasts.length - 1].channel }
            }
            return "None"
        }

        // MATCH FUNCTIONS

        /**
         * Gives the teams in a match.
         * @param {Object} match - A match.
         * @returns {Object[]} An array of the teams in the match.
         * @async
         */
        async getTeamsInMatch(match) {
            var teams = [];
            var bluelen = match.alliances.blue.team_keys.length;

            teams.push(match.alliances.blue.team_keys);
            teams.push.apply(match.alliances.blue.team_keys, match.alliances.red.team_keys);
            teams = teams[0];

            for (var i = 0; i < teams.length; i++) {
                var obj = await this.getTeam(teams[i].substring(3));
                teams[i] = JSON.stringify(obj);
            }

            var redteam = teams.slice(bluelen);
            var blueteam = teams.slice(0, bluelen);
            var json = "{\"blue\":[" + blueteam + "], \"red\":[" + redteam + "]}";
            return JSON.parse(json);
        }

        /**
         * Tells wether or not a match has concluded.
         * @param {Object} match - A match.
         * @returns {Boolean} Wether or not a match has concluded.
         */
        isMatchDone(match) {
            if (match.actual_time < new Date().getTime()) return true;
            return false;
        }

    };

    //Create a new TBA instance, using a api key
    var tba = new BlueAlliance("Ua3r31Aj25s9jfFcF9J6R3loFrE9p038ID5JyJpVS9HEjUysLDNfvRk5ZXcm3zyG");

    //Register a getEvents using EventEmitter
    callEvent.on("getEvents", async (year) => {
        console.log("called events")
        //This calls the event in the class, using async code to await a return (for data)
        let events = await tba.getEvents(year)
        console.log("sending events")
        //After data has been stored into events, lets pass it back to the response event
        responseEvent.emit("getEvents", events)
    })
    //Tell any events waiting, they it can be called upon
    callEvent.emit("ready")
    //Tell the entire plugin thats it now fully loaded and ready for any operations
    ready = true
})
Observo.register(null, {
    GLOBAL: {
        getEvents: (name, year, callback) => {
            //Make function to call
            let main = async () => {
                //Okay the ready event or the plugin was already ready occured
                console.log("getting events")
                //Now tell the plugin we want to getEvents
                callEvent.emit("getEvents", year)
                //Wait for a response form it. Only make this callback occur once.
                responseEvent.once("getEvents", (data) => {
                    console.log("returning events")
                    //Send data back to the plugin/api it was being called from.
                    callback(data)
                })
            }
            //Is the plugin ready?
            if (ready) {
                main()
            } else {
                //If not lets wait for it to send the event
                callEvent.once("ready", () => {
                    main()
                })
            }

        }
    },
})