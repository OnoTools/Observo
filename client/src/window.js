import {remote} from 'electron'
const { BrowserWindow } = remote
export default class Window {
    constructor(id) {
      this.win = BrowserWindow.fromId(parseInt(id))
      this.id = id
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
    addMaximizeListener(func) {
      this.win.on('maximize', func)
    }
    addUnmaximizeListener(func) {
      this.win.on('unmaximize', func)
    }
    addResizeListener(func) {
      this.win.on('resize', func)
    }
    close() {
      this.win.close();
    }
  }