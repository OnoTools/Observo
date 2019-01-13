/**
 * FRC Pack
 * - Teams Plugin
 * @author ImportProgram @OnoTools
 * @version 1.0.0
 */
Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch } = require("@blueprintjs/core")

    //let a = imports.api.socket.use()
    class Team extends React.Component {
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
                eventMembers: {},
            }
        }
        /**
         * React Lifecycle Method
         * @param {Object} nextProps 
         */
        componentWillReceiveProps(nextProps) {
            //Close the TAB if USER wants to? (yes)
            if (this.props.onClose != nextProps.onClose) {
                this.socketObject.close()
                this.props.close()
            }
        }
        componentDidMount() {
            //Connect to SOCKET SERVER from PLUGIN on SERVER
            let socketObject = imports.api.socket.use(null) //use it
            this.socketObject = socketObject
            //When we connect, lets AUTH the user
            socketObject.on("connect", () => {
                //First send the auth
                imports.api.auth.use(socketObject)
                //Act to that request when the server accepts it. If it doesn't Nothing will happen. The core socket will take care of it
                imports.api.auth.vaild(socketObject, () => {
                    imports.api.page.usePage(socketObject, this.props.uuid)
                    //Updates ALL team members
                    socketObject.on("team_updateMembers", (members) => {
                        this.setState({ members })
                    })
                    //Update the EVENTS from PLUGINS:EVENTS. 
                    socketObject.on("team_eventList", (events) => {
                        console.log(events)
                        this.setState({ events })
                    })
                    //Updates the EDIT LIST to what USER are using
                    socketObject.on("team_updateEditList", ({ edits }) => {
                        console.log(edits)
                        this.setState({ edits })
                    })
                    //Updates the MEMBER LIST PER EVENT
                    socketObject.on("team_updateEventMemberList", ({ teammates }) => {
                        this.setState({ eventMembers: teammates })
                    })
                    //Update this USER who are they editing? (!)
                    socketObject.on("team_editingMember", ({ member }) => {
                        this.setState({ editUser: member })
                    })
                    //Update this USER that they are not editing anymore.
                    socketObject.on("team_stoppedEdit", () => {
                        this.setState({ editUser: null })
                    })
                })
            })
        }
        /**
         * SaveMembers - When a user saves the members for that list
         */
        async onSaveMembers() {
            this.socketObject.emit("team_saveEventMembers", {event: this.state.eventChoice})
        }
        /**
         * When a user submits the ADD/SAVE button for a new user or editing an user
         */
        async onUserSubmit() {
            if (this.state.firstName.length > 0 && this.state.lastName.length > 0 && this.state.editUser == null) {
                this.socketObject.emit("team_addMember", { firstName: this.state.firstName, lastName: this.state.lastName })
                this.setState({ firstName: "", lastName: "", })
            } else {
                this.socketObject.emit("team_updateMember", { firstName: this.state.firstNameEdit, lastName: this.state.lastNameEdit, member: this.state.editUser })
            }
        }
        /**
         * FirstName - On FirstName Input, update the state depending on edit state
         * @param {Object} event 
         */
        async onInputFirstName(event) {
            if (this.state.editUser == null) {
                this.setState({ firstName: event.currentTarget.value })
            } else {
                this.setState({ firstNameEdit: event.currentTarget.value })
            }
        }
        /**
         * LastName - On LastName Input, update the state depending on edit state
         * @param {Object} event 
         */
        async onInputLastName(event) {
            if (this.state.editUser == null) {
                this.setState({ lastName: event.currentTarget.value })
            } else {
                this.setState({ lastNameEdit: event.currentTarget.value })
            }
        }
        /**
         * EditClick - When the user clicks a edit button for a member on the team. 
         * @param {String} uuid 
         */
        async onEditClick(uuid) {
            this.socketObject.emit("team_isEditing", { uuid })
            for (let m in this.state.members) {
                let disabled = false
                let member = this.state.members[m]
                if (uuid == member.uuid) {
                    console.log("yeshhh")
                    this.setState({ lastNameEdit: member.lastName, firstNameEdit: member.firstName })
                }
            }
        }
        /**
         * Invites a member on to a team. 
         * @param {String} member MEMBER UUID
         */
        async onInviteMember(member) {
            this.socketObject.emit("team_inviteMember", { member, event: this.state.eventChoice })
        }
        /**
         * SelectEvent - When an event is selected
         * @param {String} event EVENT UUID
         */
        async onSelectEvent(event) {
            this.setState({ eventChoice: event.target.value })
        }
        /**
         * Remove a MEMEBER from and EVENT
         * @param {String} member MEMBER UUID
         * @param {String} event EVENT UUID 
         */
        async onRemoveUser(member, event) {
            this.socketObject.emit("team_removeMember", { member, event })
        }
        /**
         * Renders ALL member list
         */
        renderMembers() {
            //Make a list of items
            let items = []
            let loop = 0 //Use a loop for coloring.
            let uuid = false
            //Loop all. TODO: Use a map?
            for (let m in this.state.members) {
                //Is the EDIT button disabled?
                let disabled = false
                //What member are we actually using
                let member = this.state.members[m]
                //Also whats the uuid?
                uuid = member.uuid
                //Color every other row
                let background = "lightgray"
                if (loop % 2 == 0) {
                    background = "gray"
                }
                //Lets also color the row if someone is editing it (realtime)
                for (let e in this.state.edits) {
                    //The EDIT is the MEMBER UUID. Also uuid can be used
                    let edit = this.state.edits[e]
                    if (edit == member.uuid) { //We don't use UUID variable because its used for the button in the array below
                        background = "orange" //Change the color 
                        if (imports.api.auth.uuid() != e) { //If the user is now the one editing, make it disabled. 
                            disabled = true
                        } else {
                            uuid = false //IF the user is editing this MEMBER, make UUID false. This tells the server when click to end EDTING mode
                        }
                    }
                }
                //Render the code via an item
                items.push(<Layout.Grid key={m} col style={{ marginBottom: 10, padding: 10 }} background={background}>
                    <Layout.Grid>{member.firstName}</Layout.Grid>
                    <Layout.Grid>{member.lastName}</Layout.Grid>
                    <Layout.Grid><Button className="pt-minimal" disabled={disabled} icon="edit" onClick={this.onEditClick.bind(this, uuid)} /></Layout.Grid>
                    <Layout.Grid><Button className="pt-minimal" icon="add" onClick={this.onInviteMember.bind(this, uuid)} /></Layout.Grid>
                </Layout.Grid>)
                loop++
            }
            return items
        }
        renderEventMembers() {
            let items = []
            let loop = 0
            let uuid = false
            if (this.state.eventMembers[this.state.eventChoice] == null && this.state.eventChoice != "none") {
                this.state.eventMembers[this.state.eventChoice] = {}
            }
            if (this.state.eventChoice != "none") {
                for (let uuid in this.state.eventMembers[this.state.eventChoice]) {
                    let canBeRemoved = this.state.eventMembers[this.state.eventChoice][uuid]
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
        /**
         * RenderEvents - Renders all events in the dropdown/select
         */
        renderEvents() {
            let items = []
            for (let e in this.state.events) {
                let event = this.state.events[e]
                items.push(<option value={e}>{event}</option>)
            }
            return items
        }
        render() {
            //Check if the user is editing, if so check some text, and some colors
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
                            <p className="center" style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", width: "100%" }}><br />All Team Members</p>
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
                            <p className="center" style={{ fontWeight: "bold", fontSize: 24, textAlign: "center", width: "100%" }}><br />Event Members</p>
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
                        {this.renderEventMembers()}
                    </Layout.Grid>
                    <Layout.Grid col center>
                        <Button intent={Intent.SUCCESS} onClick={this.onSaveMembers.bind(this)}>Save Members</Button>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid >
        }
    }


    imports.api.page.register(Team)

})
Observo.register(null, {
    GLOBAL: {},
})