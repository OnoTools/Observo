Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch } = require("@blueprintjs/core")


    class Professions extends React.Component {
        constructor() {
            super()
            this.state = {
                professions: {},
                editors: {},
                editing: false,
                name: "",
                binded: "",
                editName: "",
                editBinded: "none",
            }
        }
        componentDidMount() {
            let socketObject = this.props.socketObject
            console.log(socketObject)
            socketObject.on("scheduler_professions_updateList", (professions) => {
                this.setState({ professions })
            })
            socketObject.on("scheduler_professions_editing", ({ editors }) => {
                console.log("EDITIORS")
                console.log(editors)
                this.setState({ editors })
            })
            socketObject.on("scheduler_professions_isEditing", ({ profession }) => {
                this.setState({ editing: profession })

            })
            socketObject.on("scheduler_professions_stopEditing", () => {
                this.setState({ editing: false })
            })
            socketObject.emit("scheduler_professions_updateList") //Force server to send data again.
            this.socketObject = socketObject
        }
        async onInputName(event) {
            console.log(this.state.editing)
            if (!this.state.editing) {
                let name = event.currentTarget.value
                this.setState({ name })
            } else {
                let editName = event.currentTarget.value
                this.setState({ editName })
            }
        }
        async onAddProfession() {
            if (!this.state.editing) {
                let name = this.state.name
                let binded = this.state.binded
                this.socketObject.emit("scheduler_professions_add", { name, binded })
            } else {
                let name = this.state.editName
                let binded = this.state.editBinded
                let profession = this.state.editing
                this.socketObject.emit("scheduler_professions_update", { name, binded, profession })
            }
        }
        async onEdit(uuid) {
            this.socketObject.emit("scheduler_professions_editing", { uuid })
            for (let p in this.state.professions) {
                let profession = this.state.professions[p]
                if (uuid == profession.uuid) {
                    this.setState({ editName: profession.name, editingBinded: profession.binded })
                }
            }
        }
        async onRemove() {
            this.socketObject.emit("scheduler_professions_remove", { uuid })
        }
        renderItems() {
            let items = []
            let loop = 0
            let disabled = false
            for (let p in this.state.professions) {
                let profession = this.state.professions[p]
                let uuid = profession.uuid
                //CHECK IF EDITING
                let background = "lightgray"
                if (loop % 2 == 0) {
                    background = "gray"
                }
                for (let e in this.state.editors) {
                    let edit = this.state.editors[e]
                    if (edit == profession.uuid) {
                        background = "orange"
                        if (imports.api.auth.uuid() != e) {
                            disabled = true
                        } else {
                            uuid = false
                        }
                    }
                }
                items.push(<Layout.Grid col style={{ marginBottom: 10, padding: 10 }} background={background}>
                    <Layout.Grid>{profession.name}</Layout.Grid>
                    <Layout.Grid width={30}><Button className="pt-minimal" icon="add" > </Button></Layout.Grid>
                    <Layout.Grid width={30}><Button className="pt-minimal" icon="edit" disabled={disabled} onClick={this.onEdit.bind(this, uuid)} /> </Layout.Grid>
                    <Layout.Grid width={30}><Button className="pt-minimal" icon="cross" intent={Intent.DANGER} onClick={this.onRemove.bind(this, uuid)} /></Layout.Grid>
                </Layout.Grid>)
                loop++
            }
            return items
        }
        render() {
            let name = this.state.name
            let title = "Add"
            let intent = Intent.SUCCESS
            if (this.state.editing) {
                name = this.state.editName
                title = "Save"
                intent = Intent.WARNING
            }
            return <Layout.Grid row>
                <Layout.Grid className="center" width="100%" style={{ padding: 10 }}>
                    <p className="center" style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", width: "100%" }}><br />Professions</p>
                </Layout.Grid>
                <Layout.Grid col style={{ margin: 30 }} height={30}>
                    <Layout.Grid>
                        <InputGroup
                            value={name}
                            onChange={this.onInputName.bind(this)}
                            placeholder="Name"
                            style={
                                {
                                    width: 150,
                                    height: 30
                                }
                            }
                        />
                    </Layout.Grid>
                    <Layout.Grid style={{ marginLeft: 10 }}>
                        <div className="bp3-select bp3-fill">
                            <select defaultValue="none">
                                <option value="none">Bind to?</option>
                            </select>
                        </div>
                    </Layout.Grid>
                    <Layout.Grid style={{ marginLeft: 10 }}>
                        <Button intent={Intent.SUCCESS} intent={intent} onClick={this.onAddProfession.bind(this)}>{title}</Button>
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid className="scrollY" background="gray" height={500} width={400} style={{ overflowY: 'auto', overflow: "overlay" }}>
                    {this.renderItems()}
                </Layout.Grid>
            </Layout.Grid>
        }
    }


    class Scheduler extends React.Component {
        constructor() {
            super()
            this.state = {
                events: {},
                eventChoice: "none",
                navbarTabId: "prof",
                showTabs: false,
                members: {}
            }
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.socketObject.close()
                this.props.close()
            }
        }
        componentDidMount() {
            let socketObject = imports.api.socket.use(null)
            this.socketObject = socketObject
            socketObject.on("connect", () => {
                imports.api.auth.use(socketObject)
                imports.api.auth.vaild(socketObject, () => {
                    imports.api.page.usePage(socketObject, this.props.uuid)
                    socketObject.on("scheduler_eventList", (events) => {
                        this.setState({ events })
                    })
                    socketObject.on("scheduler_memberList", (members) => {
                        this.setState({ members })
                    })
                })
            })
            this.setState({ showTabs: true })
        }
        /**
         * Handles the onChange event for the dropdown/select
         * @param {String} event 
         */
        async onSelectEvent(event) {
            this.setState({ eventChoice: event.target.value })
        }
        /**
         * Handles the onChange event for the tabs
         * @param {String} navbarTabId 
         */
        async handleNavbarTabChange(navbarTabId) {
            this.setState({ navbarTabId })
        }
        /**
         * Renders Events (in select box)
         */
        renderEvents() {
            let items = []
            for (let e in this.state.events) {
                let event = this.state.events[e]
                items.push(<option key={e} value={e}>{event}</option>)
            }
            return items
        }
        renderSchedule() {
            if (this.state.eventChoice == "none") {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>No event selected.</p>
                </div>
            } else {
                let items = []
                for (let m in this.state.members) {
                    let member = this.state.members[m]
                    items.push(<Layout.Grid>{member.name}</Layout.Grid>)
                }
                return <Layout.Grid row>{items}</Layout.Grid>
            }
        }
        renderTabs() {
                        let items = []
            if (this.state.showTabs) {

                        let hideProf = {display: "none" }
                let hideRule = {display: "none" }
                if (this.state.navbarTabId == "prof") {
                        hideProf = {}
                    }
                    items.push(<div key="prof" style={hideProf} >
                        <Professions socketObject={this.socketObject} />
                    </div>)
                }
                return items
            }
        render() {
            return <Layout.Grid row style={{ position: "relative" }}>
                        <Layout.Grid col>
                            <Layout.Grid row height={this.props.height} width={400} background="lightgray">
                                <Layout.Grid height={30}>
                                    <div className="bp3-select bp3-fill">
                                        <select defaultValue={this.state.eventChoice} onChange={this.onSelectEvent.bind(this)}>
                                            <option value="none">Select Event...</option>
                                            {this.renderEvents()}
                                        </select>
                                    </div>
                                </Layout.Grid>
                                <Layout.Grid col center height={50} style={{ padding: 10 }} className="center" background="#BDBDBD">
                                    <Tabs
                                        animate={false}
                                        id="scheduler_tabs"
                                        large={true}
                                        onChange={this.handleNavbarTabChange.bind(this)}
                                        selectedTabId={this.state.navbarTabId}

                                    >
                                        <Tab id="prof" title="Professions" ></Tab>
                                        <Tab id="rule" title="Rules" ></Tab>
                                    </Tabs>
                                </Layout.Grid>
                                <Layout.Grid>
                                    {this.renderTabs()}
                                </Layout.Grid>
                            </Layout.Grid>
                            <Layout.Grid style={{ padding: 30 }}>
                                {this.renderSchedule()}
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                    }
                }
                imports.api.page.register(Scheduler)
            })
Observo.register(null, {
                        GLOBAL: {},
})