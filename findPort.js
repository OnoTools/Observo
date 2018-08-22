let data = `Error
    at Object.register (eval at run (E:\ObservoGithub\client\src\projects\defined.js:384), <anonymous>:51:27)
    at la (eval at run (E:\ObservoGithub\client\src\projects\defined.js:384), <anonymous>:39:24)
    at example (eval at run (E:\ObservoGithub\client\src\projects\defined.js:384), <anonymous>:41:5)
    at Manager.<anonymous> (E:\ObservoGithub\client\src\projects\defined.js:369)
    at emitNone (events.js:91)
    at Manager.emit (events.js:185)
    at Manager.checkMounting (E:\ObservoGithub\client\src\projects\defined.js:407)
    at Object.register (E:\ObservoGithub\client\src\projects\defined.js:352)
    at module.exports (eval at run (E:\ObservoGithub\client\src\projects\defined.js:384), <anonymous>:43:11)
    at Manager.run (E:\ObservoGithub\client\src\projects\defined.js:386)`

let a = data.split("\n")

var neewArr=a.splice(a.indexOf("    at Manager.<anonymous> (E:\ObservoGithub\client\src\projects\defined.js:369)"));
neewArr.shift(0);
var re =  /(\w+)@|at (\w+) /, st = a[a.length-1], m;
re.exec(st), m = re.exec(st);
name = m[2];
console.log(name)
/*
var re =  /(\w+)@|at (\w+) /, st = z[z.length-1], m;
    re.exec(st), m = re.exec(st);
console.log(m[2])
*/