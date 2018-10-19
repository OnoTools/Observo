

var main = async function() {
    var team = await tba.getTeam(2337);
    console.log(team.nickname); // Prints "DeepVision"
    var events = await tba.getEvents("2018")
    console.log(JSON.stringify(events))
    /*
    let z = true
    let loop = 0
    while (z) {
        loop ++
        var teams = await tba.getTeams(loop)
        
        if (JSON.stringify(teams) == "[]") {
            z = false
        } else {
            console.log(JSON.stringify(teams))
            console.log(loop)
        }
    }*/
}

main();