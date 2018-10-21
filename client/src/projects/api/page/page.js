//Example (Client) Page

class LoadedPages {
    constructor() {
        this.pages = {}
    }
    addPage(name, component) {
        if (this.pages[name] == null) {
            this.pages[name] = component
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
        usePage: (name, socket, uuid) => {
            socket.emit(`${name}_verifyPage`, {uuid: uuid})
        }
    },
    API: {
        getPage: (name) => {
            return loaded.renderPage(name)
        }
    }
  })