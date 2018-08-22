//Example (Client) Page
class LoadedPages {
    constructor() {
        this.pages = {}
    }
    addPage(name, component) {
        console.log(name)
        console.log(component)
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
Observo.onMount((imports) => {

})
Observo.register(null, {
    GLOBAL: {
        register: (component) => {
            console.log(component)
            let name;
            try { throw new Error(); }
            catch (e) {
                var re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
                re.exec(st), m = re.exec(st);
                name = m[1] || m[2];
            }
            loaded.addPage(name, component)
        }
    },
    API: {
        getPage: (name) => {
            return loaded.renderPage(name)
        }
    }
  })