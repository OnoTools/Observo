//Example (Client) Page

class LoadedPages {
    constructor() {
        this.pages = {}
        this.offsets = {}
    }
    addPage(name, component) {
        if (this.pages[name] == null) {
            this.pages[name] = component
            this.offsets[name] = {width: 0, height: 0}
        }
    }
    setOffset(name, offset) {
        this.offsets[name] = offset
    }
    getHeightOffset(name) {
        if (this.offsets[name] != null) {
            return this.offsets[name].height
        }
    }
    getWidthOffset(name) {
        if (this.offsets[name] != null) {
            return this.offsets[name].width
        }
    }
    listPages() {
        return this.pages
    }
    renderPage(name) {
        if (this.pages[name] != null) {
            return this.pages[name]
        }
    }
}
let loaded = new LoadedPages()
Observo.register(null, {
    GLOBAL: {
        register: (name, component) => {
            loaded.addPage(name, component)
        },
        setOffset(name, offsets) {
            loaded.setOffset(name, offsets)
        },
        usePage: (name, socket, uuid) => {
            socket.emit(`${name}_verifyPage`, {uuid: uuid})
        }
    },
    API: {
        getPage: (name) => {
            return loaded.renderPage(name)
        },
        getHeightOffset: (name) => {
            return loaded.getHeightOffset(name)
        },
        getWidthOffset: (name) => {
            return loaded.getWidthOffset(name)
        }
    }
  })