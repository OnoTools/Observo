
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
    addResizeListener(callback) {
        this.win.on('resize', callback)
    }
    onResize(callback) {
        this.win.on('resize', callback)
        this.win.on('unmaximize', callback)
        this.win.on('maximize', callback)
    }
    close() {
        this.win.close();
    }
}
