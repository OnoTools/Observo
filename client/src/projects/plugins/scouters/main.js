Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch } = require("@blueprintjs/core")

    //let a = imports.api.socket.use()
    class Example extends React.Component {
        constructor() {
            super()
            this.state = {
                members: [],
                edits: {},
                firstName: "",
                lastName: "",
                lastNameEdit: "",
                firstNameEdit: "",
                editUser: null,
                eventChoice: "none",
                events: {},
                eventScouters: {},
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
                    socketObject.on("scouters_updateMembers", (members) => {
                        this.setState({ members })
                    })
                    socketObject.on("scouters_eventList", (events) => {
                        console.log(events)
                        this.setState({ events })
                    })
                    socketObject.on("scouters_updateEditList", ({ edits }) => {
                        console.log(edits)
                        this.setState({ edits })
                    })
                    socketObject.on("scouters_updateScoutList", ({ scouters }) => {
                        this.setState({ eventScouters: scouters })
                    })
                    socketObject.on("scouters_editingMember", ({ member }) => {
                        this.setState({ editUser: member })
                    })
                    socketObject.on("scouters_stoppedEdit", () => {
                        this.setState({ editUser: null })
                    })
                })
            })
        }
        async onUserSubmit() {
            if (this.state.firstName.length > 0 && this.state.lastName.length > 0 && this.state.editUser == null) {
                this.socketObject.emit("scouters_addMember", { firstName: this.state.firstName, lastName: this.state.lastName })
                this.setState({ firstName: "", lastName: "", })
            } else {
                this.socketObject.emit("scouters_updateMember", { firstName: this.state.firstNameEdit, lastName: this.state.lastNameEdit, member: this.state.editUser })
            }
        }
        async onInputFirstName(event) {
            if (this.state.editUser == null) {
                this.setState({ firstName: event.currentTarget.value })
            } else {
                this.setState({ firstNameEdit: event.currentTarget.value })
            }
        }
        async onInputLastName(event) {
            if (this.state.editUser == null) {
                this.setState({ lastName: event.currentTarget.value })
            } else {
                this.setState({ lastNameEdit: event.currentTarget.value })
            }
        }
        async onEditClick(uuid) {
            this.socketObject.emit("scouters_isEditing", { uuid })
            for (let m in this.state.members) {
                let disabled = false
                let member = this.state.members[m]
                if (uuid == member.uuid) {
                    console.log("yeshhh")
                    this.setState({ lastNameEdit: member.lastName, firstNameEdit: member.firstName })
                }
            }
        }
        async onInviteMember(member) {
            this.socketObject.emit("scouters_inviteMember", { member, event: this.state.eventChoice })
        }
        async onSelectEvent(event) {
            this.setState({ eventChoice: event.target.value })
        }
        async onRemoveUser(member, event) {
            this.socketObject.emit("scouters_removeMember", {member, event})
        }
        renderMembers() {
            let items = []
            let loop = 0
            let uuid = false
            for (let m in this.state.members) {
                let disabled = false
                let member = this.state.members[m]
                uuid = member.uuid
                let background = "lightgray"
                if (loop % 2 == 0) {
                    background = "gray"
                }
                for (let e in this.state.edits) {
                    let edit = this.state.edits[e]
                    console.log(edit)
                    console.log(member.uuid)
                    if (edit == member.uuid) {
                        background = "orange"
                        if (imports.api.auth.uuid() != e) {
                            disabled = true
                        } else {
                            uuid = false
                        }
                    }
                }
                items.push(<Layout.Grid col style={{ marginBottom: 10, padding: 10 }} background={background}>
                    <Layout.Grid>{member.firstName}</Layout.Grid>
                    <Layout.Grid>{member.lastName}</Layout.Grid>
                    <Layout.Grid><Button className="pt-minimal" disabled={disabled} icon="edit" onClick={this.onEditClick.bind(this, uuid)} /></Layout.Grid>
                    <Layout.Grid><Button className="pt-minimal" icon="add" onClick={this.onInviteMember.bind(this, uuid)} /></Layout.Grid>
                </Layout.Grid>)
                loop++
            }
            return items
        }
        renderScouters() {
            let items = []
            let loop = 0
            let uuid = false
            if (this.state.eventScouters[this.state.eventChoice] == null && this.state.eventChoice != "none") {
                this.state.eventScouters[this.state.eventChoice] = {}
            }
            if (this.state.eventChoice != "none") {
                for (let uuid in this.state.eventScouters[this.state.eventChoice]) {
                    let canBeRemoved = this.state.eventScouters[this.state.eventChoice][uuid]
                    for (let m in this.state.members) {
                        let member = this.state.members[m]
                        if (member.uuid == uuid) {
                            let background = "lightgray"
                            if (loop % 2 == 0) {
                                background = "gray"
                            }
                            items.push(<Layout.Grid col style={{ marginBottom: 10, padding: 10 }} background={background}>
                                <Layout.Grid>{member.firstName}</Layout.Grid>
                                <Layout.Grid>{member.lastName}</Layout.Grid>
                                <Layout.Grid><Button className="pt-minimal" disabled={canBeRemoved} icon="cross" onClick={this.onRemoveUser.bind(this, member.uuid, this.state.eventChoice)} /></Layout.Grid>
                            </Layout.Grid>)
                            loop++
                        }
                    }
                }
            }
            return items
        }
        renderEvents() {
            let items = []
            for (let e in this.state.events) {
                let event = this.state.events[e]
                items.push(<option value={e}>{event}</option>)
            }
            return items
        }
        render() {
            let buttonText = "Add User"
            let titleText = "Add User"
            let btnIntent = Intent.SUCCESS
            let lastName = this.state.lastName
            let firstName = this.state.firstName
            if (this.state.editUser != null) {
                lastName = this.state.lastNameEdit
                firstName = this.state.firstNameEdit
                buttonText = "Update User"
                titleText = "Edit User"
                btnIntent = Intent.WARNING
            }
            return <Layout.Grid col>
                <Layout.Grid row>
                    <Layout.Grid style={{ padding: 30, margin: "30px 30px 0px 30px", borderTopRightRadius: 10, borderTopLeftRadius: 10 }} width={400} background="lightgray">
                        <Layout.Grid className="center" width="100%" style={{ padding: 10 }}>
                            <p className="center" style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", width: "100%" }}><br />Team Members</p>
                            <p className="center" style={{ fontSize: "18", textAlign: "center", width: "100%" }}><br />{titleText}</p>
                        </Layout.Grid>
                        <Layout.Grid col>
                            <Layout.Grid>
                                <InputGroup
                                    value={firstName}
                                    onChange={this.onInputFirstName.bind(this)}
                                    placeholder="First Name"
                                    style={
                                        {
                                            width: 100,
                                            height: 30
                                        }
                                    }
                                />
                            </Layout.Grid>
                            <Layout.Grid>
                                <InputGroup
                                    value={lastName}
                                    onChange={this.onInputLastName.bind(this)}
                                    placeholder="Last Name"
                                    style={
                                        {
                                            width: 100,
                                            height: 30
                                        }
                                    }
                                />
                            </Layout.Grid>
                            <Layout.Grid>
                                <Button intent={btnIntent} onClick={this.onUserSubmit.bind(this)}>{buttonText}</Button>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid className="scrollY" background="gray" height={500} width={400} style={{ overflowY: 'auto', overflow: "overlay", margin: "0px 30px 30px 30px", borderBottomRightRadius: 10, borderBottmRadius: 10 }}>
                        {this.renderMembers()}
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid row>
                    <Layout.Grid style={{ padding: 30, margin: "30px 30px 0px 30px", borderTopRightRadius: 10, borderTopLeftRadius: 10 }} width={400} background="lightgray">
                        <Layout.Grid className="center" width="100%" style={{ padding: 10 }}>
                            <p className="center" style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", width: "100%" }}><br />Event Scouters</p>
                            <p className="center" style={{ fontSize: "18", textAlign: "center", width: "100%" }}><br />Select Event</p>
                        </Layout.Grid>
                        <Layout.Grid col>
                            <div className="bp3-select bp3-fill">
                                <select defaultValue={this.state.eventChoice} onChange={this.onSelectEvent.bind(this)}>
                                    <option value="none">Choose an item...</option>
                                    {this.renderEvents()}
                                </select>
                            </div>
                        </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid className="scrollY" background="gray" height={500} width={400} style={{ overflowY: 'auto', overflow: "overlay", margin: "0px 30px 30px 30px", borderBottomRightRadius: 10, borderBottmRadius: 10 }}>
                        {this.renderScouters()}
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid >
        }
    }


    imports.api.page.register(Example)

})
Observo.register(null, {
    GLOBAL: {},
})