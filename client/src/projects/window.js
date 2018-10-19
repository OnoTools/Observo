
import { remote } from 'electron'
const { BrowserWindow } = remote
import managerLocal from 'import-window'
let args
if (managerLocal.hasArgs()) {
    args = managerLocal.parseArgs()
}
export default class CustomWindow {
    constructor() {
        this.win = BrowserWindow.fromId(parseInt(args.id))
        this.id = parseInt(args.id)
        this.resizes = []
        this.win.on('resize', this._resize.bind(this))
        this.timerResize = setTimeout(() => { }, 100);
    }
    _resize(e) {
        e.preventDefault();
        clearTimeout(this.timerResize);
        this.timerResize = setTimeout(() => {
            console.log("being called")
            for (let r in this.resizes) {
                console.log(r)
                this.resizes[r]()
            }
        }, 100);

    }
    maximize() {
        this.win.maximize();
    }
    unmaximize() {
        this.win.unmaximize();
    }
    minimize() {
        this.win.minimize();
    }
    addMaximizeListener(callback) {
        this.win.on('maximize', callback)
    }
    addUnmaximizeListener(callback) {
        this.win.on('unmaximize', callback)
    }
    onResize(callback) {
        this.resizes.push(callback)
    }
    close() {
        this.win.close();
    }
}
