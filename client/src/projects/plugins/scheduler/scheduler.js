Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, NumericInput, RadioGroup, Radio, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch, ContextMenu, Menu } = require("@blueprintjs/core")


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
    class Settings extends React.Component {
        constructor() {
            super()
            this.state = {
                unit: "match"
            }
        }
        async onUnitofProgressChange(event) {
            this.setState({ unit: event.target.value })
        }
        renderInterval() {
            let title = "Match"
            if (this.state.unit == "time") {
                title = "Time"
            }
            return <Layout.Grid col>
                <Layout.Grid width={170} style={{ paddingTop0: 8, paddingLeft: 10 }}>
                    <p style={{ fontWeight: "bold", fontSize: 16 }}>{title} Interval</p>
                </Layout.Grid>
                <Layout.Grid>
                    <NumericInput />
                </Layout.Grid>
            </Layout.Grid>
        }
        render() {
            return <Layout.Grid row>
                <Layout.Grid style={{ padding: 10 }}>
                    <RadioGroup
                        label={<p style={{ fontWeight: "bold", fontSize: 16 }}>Unit of Progress</p>}
                        onChange={this.onUnitofProgressChange.bind(this)}
                        selectedValue={this.state.unit}
                        inline={true}
                    >
                        <Radio label="Time" value="time" />
                        <Radio label="Match" value="match" />
                    </RadioGroup>
                </Layout.Grid>
                <Layout.Grid>
                    {this.renderInterval()}
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
                sidebarTabId: "professions",
                showTabs: false,
                //SCHEDULER
                members: {},
                memberData: {},
                dayTabId: 0
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
                        console.log(members)
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
            let getDaysArray = function (s, e) { for (var a = [], d = s; d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)); } return a; };
            let sD = this.state.events[event.target.value].startDate
            let eD = this.state.events[event.target.value].endDate
            let days = getDaysArray(new Date(sD), new Date(eD))
            console.log(days)
            let memberData = this.state.memberData
            if (memberData[event.target.value] == null) {
                memberData[event.target.value] = {}
            }
            for (let day in days) {
                if (memberData[event.target.value][day] == null) {
                    memberData[event.target.value][day] = {}
                }
            }
            this.socketObject.emit("scheduler_editor_selectEvent", { day: days[this.state.dayTabId], event: event.target.value })
            this.setState({ eventChoice: event.target.value, days, memberData, dayTabId: 0 })
        }
        async handleTabDayChange(dayTabId) {
            this.socketObject.emit("scheduler_editor_selectEvent", { day: this.state.days[dayTabId], event: this.state.eventChoice })
            this.setState({ dayTabId })

        }
        /**
         * Handles the onChange event for the tabs
         * @param {String} sidebarTabId 
         */
        async handleSidebarTabChange(sidebarTabId) {
            this.setState({ sidebarTabId })
        }

        /**
         * Renders Events (in select box)
         */
        renderEvents() {
            let items = []
            for (let e in this.state.events) {
                let event = this.state.events[e]
                items.push(<option key={e} value={e}>{event.name}</option>)
            }
            return items
        }
        /**
         * Hides/Show a USER on a schedule
         */
        async onScheduleVisUser(event, day, uuid) {
            let memberData = this.state.memberData
            if (!memberData[event][day][uuid].hide) {
                memberData[event][day][uuid].hide = true
            } else {
                memberData[event][day][uuid].hide = false
            }
            this.setState({ memberData })
        }
        renderSchedule() {
            if (this.state.eventChoice == "none") {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>No event selected.</p>
                </div>
            } else {
                let items = []
                items.push(<Layout.Grid style={{ padding: 3, borderBottom: "1px solid gray", fontWeight: "bold", fontSize: 18 }} >Name</Layout.Grid>)
                for (let m in this.state.members) {
                    let member = this.state.members[m]
                    let uuid = member.uuid
                    let event = this.state.eventChoice
                    let day = this.state.dayTabId
                    let memberData = this.state.memberData[event][day]

                    if (memberData[uuid] == null) {
                        memberData[uuid] = { hide: false }
                    }
                    if (memberData[uuid] == null) {
                        memberData[uuid] = { hide: false }
                    }
                    let background = "white"
                    let visibleText = "Hide"
                    let icon = "eye-off"
                    if (memberData[uuid].hide) {
                        background = "red"
                        visibleText = "Show"
                        icon = "eye-open"
                    }
                    let menu = <Menu>
                        <MenuItem icon={icon} text={visibleText} onClick={this.onScheduleVisUser.bind(this, event, day, uuid)} />
                    </Menu>

                    items.push(<Layout.Grid background={background} onContextMenu={(event) => { ContextMenu.show(menu, { left: event.clientX, top: event.clientY }, () => { }) }} style={{ padding: 3, borderBottom: "1px solid gray" }} >{member.firstName}, {member.lastName}</Layout.Grid>)
                }
                return (<Layout.Grid col background="white">
                    <Layout.Grid row style={{ minHeight: 20, borderLeft: "1px solid black", borderRight: "1px solid black", maxWidth: 100 }} background="white">
                        {items}
                    </Layout.Grid>
                    <Layout.Grid row style={{ minHeight: 20, borderLeft: "1px solid black", borderRight: "1px solid black" }} background="white">
                        a
                    </Layout.Grid>
                </Layout.Grid>)
            }
        }
        renderSidebarView() {
            let items = []
            if (this.state.showTabs) {

                let hideProf = { display: "none" }
                let hideRule = { display: "none" }
                let hideSettings = { display: "none" }
                if (this.state.sidebarTabId == "professions") {
                    hideProf = {}
                }
                if (this.state.sidebarTabId == "settings") {
                    hideSettings = {}
                }
                items.push(<div key="prof" style={hideProf} >
                    <Professions socketObject={this.socketObject} />
                </div>)
                items.push(<div key="settings" style={hideSettings} >
                    <Settings event={this.state.eventChoice} day={this.state.dayTabId} socketObject={this.socketObject} />
                </div>)
            }
            return items
        }
        renderAreaTabs() {
            if (this.state.eventChoice != "none") {
                let items = []
                for (let d in this.state.days) {
                    let day = this.state.days[d]
                    let date = day.toLocaleDateString(this.props.locale, { weekday: 'long' });
                    items.push(<Tab id={d} title={`${date}`} ></Tab>)
                }
                return <Layout.Grid background="lightgray" style={{ padding: 30, marginBottom: 15 }}>
                    <Tabs
                        animate={false}
                        id="scheduler_tabs"
                        large={true}
                        onChange={this.handleTabDayChange.bind(this)}
                        selectedTabId={this.state.dayTabId}>
                        {items}
                    </Tabs>
                </Layout.Grid>
            }
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
                                onChange={this.handleSidebarTabChange.bind(this)}
                                selectedTabId={this.state.sidebarTabId}

                            >
                                <Tab id="professions" title="Professions" ></Tab>
                                <Tab id="rule" title="Rules" ></Tab>
                                <Tab id="settings" title="Settings" ></Tab>
                            </Tabs>
                        </Layout.Grid>
                        <Layout.Grid row>
                            {this.renderSidebarView()}
                        </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid style={{ padding: 30 }}>
                        {this.renderAreaTabs()}
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