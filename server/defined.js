require("amd-loader");
var EventEmitter=require('events').EventEmitter;
const sT=process.hrtime()
class Logging {
    constructor() {this.p=this.color('$3 Observo $f|')}
    color(a){let b=(j, k) => {return k='0' === j ? '\x1B[30m' + k : '4' === j ? '\x1B[31m' + k : '2' === j ? '\x1B[32m' + k : 'E' === j ? '\x1B[33m' + k : '1' === j ? '\x1B[34m' + k : 'D' === j ? '\x1B[35m' + k : '3' === j ? '\x1B[36m' + k : 'f' === j ? '\x1B[37m' + k : j + k, k + '\x1B[39m\x1B[0m'},c='',d=!1,e=0,f='',g=[];for (var h=0; h < a.length; h++) '$' == a[h] && (d && '' != c && (g.push(b(f, c)), d=!1, c=''), e=!0, f=''), e ? (f += a[h], 2 == f.length && (e=!1, d=!0, f=f.replace('$', ''))) : c += a[h];for (let j in d && g.push(b(f, c)), c='', g) c += g[j];return c;}
    log(a){a=`${this.p} ${this.color(`$2${a}`)}`, console.log(a)}
    info(a){a=`${this.p} ${this.color(`$3${a}`)}`, console.log(a) }
    error(a){a=`${this.p} ${this.color(`$4${a}`)}`, console.log(a)}
}
const log=new Logging()
const getPackages=function(a,b){var c=c||require('path'),d=d||require('fs'),e=d.readdirSync(a);return b=b||[],e.forEach(function(f){d.statSync(c.join(a,f)).isDirectory()?b=getPackages(c.join(a,f),b):'package.json'==f&&b.push(c.join(a,f))}),b};
const splitAt=index => x => [x.slice(0, index), x.slice(index)]
var self
class Z extends EventEmitter {
    constructor() {super();self=this;self.id="defined";this.d={};this.p=false;}
    setDefinedID(id) {this.id=id}
    appReady(a) {this.on("aR",()=>{log.info("Loaded in: $f"+(1e3*process.hrtime(sT)[0]+process.hrtime(sT)[1]/1e6).toFixed(3)+"ms"),a(log)})};
    addDefined(a,b,c,d){if(a=a.toLowerCase(),null==self.d[a]){self.d[a]={},self.d[a].__CM=d;let e=require("path").join(__dirname,b),g=getPackages(e);for(let h in g){let i=g[h];define(function(j){i=i.replace(/\\/g,"/");let m=j(i);if(m.name&&m.version&&!self.d[a][m.name]){self.d[a][m.name]={},self.d[a][m.name].p=m,self.d[a][m.name].r=!1,self.d[a][m.name].s={},log.log("$DNEW MODULE: "+m.name);let n=splitAt(i.lastIndexOf("/"))(i)[0];if(m.main){let o=n+"/"+m.main;j("fs").readFile(o,"utf8",(p,q)=>{p&&console.log("Cannot load "+m.main+"!"),self.run(q,a,m.name,c)})}else console.log("Has no 'main' file?")}})}return self.d[a]}}
    run(c, s, n, aR) {
        let cC={log:a=>{log.log(`[${s.toUpperCase()}][${n.toUpperCase()}] ${log.color(`$f${a}`)}`)},info:a=>{log.info(`[${s.toUpperCase()}][${n.toUpperCase()}] ${log.color(`$3${a}`)}`)},error:a=>{log.error(`[${s.toUpperCase()}][${n.toUpperCase()}] ${log.color(`$4${a}`)}`)}};
        let cR=(m)=>{cC.error(`REQURING of '${m}' is not allowed`)}
        aR&&(cR=require);
        var indexedDB=null;var location=null;var navigator=null;var onerror=null;var onmessage=null;var performance=null;var self=null;var webkitIndexedDB=null;var postMessage=null;var close=null;var openDatabase=null;var openDatabaseSync=null;var webkitRequestFileSystem=null;var webkitRequestFileSystemSync=null;var webkitResolveLocalFileSystemSyncURL=null;var webkitResolveLocalFileSystemURL=null;var addEventListener=null;var dispatchEvent=null;var removeEventListener=null;var dump=null;var onoffline=null;var ononline=null;var importScripts=null;var application=null;let global=null;let process=null;let exports=null;let __dirname=null;let __filename=null;
        let run=null
        let defined={register:(a,b)=>{this.d[s][n].s=b,this.d[s][n].r=!0,this.cM()},onCustomMount:a=>{this.on('mC',()=>{let b=this.getCS(s,n);a(b)})},onMount:a=>{const b=function(c,d){return Object.defineProperty(c,'name',{value:d,configurable:!0})};this.on('mI',()=>{let c=this.getGS(s,n);a=b(a,n),a(c)})},getPackage:()=>{return this.d[id][n].p}};
        let id=this.id;let l=`module.exports=function(require,console,${id},log){${c}}`;self=null
        let lC=eval(l);
        lC(cR, cC, defined, null);
    }
    cM(){var _this=this;let a=!0;for(let b in _this.d)for(let c in _this.d[b])try{!1==_this.d[b][c].r&&(a=!1)}catch(d){}a&&!_this.p&&(_this.p=!0,_this.emit('mI'),_this.emit('mC'),_this.emit('aR'))};
    getGS(a,b){var _this=this;if(_this.d[a][b].p.consumes){let c=_this.d[a][b].p.consumes,d={};for(let e in c){let f=c[e].split(":"),g=f[0],h=f[1];_this.d[g]&&(d[g]={},_this.d[g][h]&&(d[g][h]=_this.d[g][h].s.GLOBAL))}return d}return null};
    getCS(a,b){var _this=this;if(_this.d[a][b].p.consumes){let c={},d=_this.d[a].__CM;for(let f in _this.d)for(let g in c[f]={},_this.d[f])if("__CM"!=g)for(let h in c[f][g]={},d){let i=d[h];try{c[f][g][i]=_this.d[f][g].s[i]}catch(j){console.log("[DML] Doesn't Support Custom Register ("+f+":"+g+")")}}return c}return null};
}
let m=new Z()
function A(){}
A.prototype.addDefined=(id,path,aR=null,cM)=>{return m.addDefined.call(this,id,path,aR,cM);}
A.prototype.onAppReady=(cb)=>{m.appReady(cb)}
A.prototype.mountAll=()=>{m.cM()}
A.prototype.setDefinedID=(id)=>{m.setDefinedID(id)}
module.exports=A;