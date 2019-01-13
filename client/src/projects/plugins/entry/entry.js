Observo.onMount((imports) => {
    let require = imports.api.require.use

    let { Layout } = require("@importcore/crust")
    let React = require("react")
    let ReactDOM = require("react-dom")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Dialog, Intent, Classes } = require("@blueprintjs/core")
    let uuidV4 = require("uuid/v4")
    let { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd')





    console.log(imports.api.socket)
    const TYPES = {
        Input: "INPUT",
        Select: "SELECT",
        Suggest: "SUGGEST"
    }
    uuidV4()
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };
    class QuitQuestion extends React.Component {
        onCancel() {
            if (this.props.onClose) {
                this.props.onClose(true)
            }
        }
        onClose() {
            if (this.props.onClose) {
                this.props.onClose(false)
            }
        }
        render() {
            return <Dialog
                intent={Intent.DANGER}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
                title="Are you sure?"

                isOpen={this.props.isOpen}
                usePortal={false}
                height={this.props.height}
            >
                <div className={Classes.DIALOG_BODY}>
                    <p>
                        {this.props.children}
                    </p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={this.onClose.bind(this)} intent={Intent.DANGER}>Close</Button>
                        <Button onClick={this.onCancel.bind(this)}>Cancel</Button>
                    </div>
                </div>
            </Dialog>

        }
    }
    class EntryEditor extends React.Component {
        constructor() {
            super()
            this.state = {
                structure: {},
                uuidStructure: []
            }
        }
        componentDidMount() {
            let structure = this.props.structure
            let uuidStructure = []
            for (let uuid in structure) {
                uuidStructure.push(uuid)
            }
            this.setState({ structure, uuidStructure })
        }
        onChange() {
            if (this.props.onChange) {
                let structure = {}
                for (let i in this.state.uuidStructure) {
                    let uuid = this.state.uuidStructure[i]
                    console.log(uuid)
                    console.log(this.state.structure[uuid].label)
                    structure[uuid] = this.state.structure[uuid]
                }
                this.props.onChange(structure)
            }
        }
        async onInputName(uuid, event) {
            if (this.state.structure[uuid]) {
                let structure = this.state.structure
                let items = structure[uuid]
                items.label = event.currentTarget.value
                structure[uuid] = items
                this.setState({ structure })
                this.onChange()
            }
        }
        async onInputWidth(uuid, event) {
            if (this.state.structure[uuid]) {
                let structure = this.state.structure
                let items = structure[uuid]
                items.width = event.currentTarget.value
                structure[uuid] = items
                this.setState({ structure })
                this.onChange()
            }

        }
        async onAddItem() {

            let structure = this.state.structure
            let newItem = {
                label: "New Object",
                type: TYPES.Input,
                width: 120,
            }
            let uuid = uuidV4()
            structure[uuid] = newItem
            let uuidStructure = this.state.uuidStructure
            uuidStructure.push(uuid)
            this.setState({ structure, uuidStructure })
            this.onChange()
        }
        async onDragEnd(result) {
            // dropped outside the list
            if (!result.destination) {
                return;
            }
            console.log(this.state.uuidStructure)
            const items = reorder(
                this.state.uuidStructure,
                result.source.index,
                result.destination.index
            );

            this.setState({
                uuidStructure: items
            });
            console.log(items)
            this.onChange()
        }
        renderEditItems() {
            //CREATRA ARRAY
            let items = []
            for (let item in this.state.uuidStructure) {
                let uuid = this.state.uuidStructure[item]
                //Get array
                //Info is UUID of object
                let info = this.state.structure[uuid]
                let color = "lightgray"
                if (item % 2 == 0) {
                    color = "gray"
                }
                items.push(
                    <Draggable key={uuid} draggableId={uuid} index={item}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}
                                {...provided.dragHandleProps}>

                                <Layout.Grid
                                    col
                                    height={120}
                                    style={{ padding: 30, borderRadius: 5, margin: 10 }}
                                    background={color}>
                                    <Layout.Grid row>
                                        <Layout.Grid col style={{ borderBottom: "1px solid black", paddingBottom: 15 }}>
                                            <Layout.Grid width={200} style="center">
                                                <p style={{ fontSize: 18, fontWeight: "bold" }}>
                                                    Entry Label
                                                </p>
                                            </Layout.Grid>
                                            <Layout.Grid width={200} style="center">
                                                <p style={{ fontSize: 18, fontWeight: "bold" }}>
                                                    Entry Type
                                                </p>
                                            </Layout.Grid>
                                            <Layout.Grid width={200} style="center">
                                                <p style={{ fontSize: 18, fontWeight: "bold" }}>
                                                    Entry Width
                                                </p>
                                            </Layout.Grid>
                                        </Layout.Grid>
                                        <Layout.Grid col style={{ paddingTop: 10 }}>
                                            <Layout.Grid width={200}>
                                                <InputGroup onChange={this.onInputName.bind(this, uuid)} value={info.label} />
                                            </Layout.Grid>
                                            <Layout.Grid width={200} style={{ marginLeft: 10 }}>
                                                <select defaultValue="text" style={{ width: 150, padding: "5px 35px 5px 5px", fontSize: 15, border: "1px solid #ccc", height: 34, appearance: "none" }}>
                                                    <option value="text">Text</option>
                                                    <option value="search">Search</option>
                                                    <option value="color">Color</option>
                                                </select>
                                            </Layout.Grid>
                                            <Layout.Grid width={200}>
                                                <InputGroup onChange={this.onInputWidth.bind(this, uuid)} value={info.width} />
                                            </Layout.Grid>
                                        </Layout.Grid>

                                    </Layout.Grid>
                                </Layout.Grid>
                            </div>
                        )}
                    </Draggable>
                )
            }
            //RENDER ARRAY
            return items
        }
        renderExample() {
            let items = []
            for (let item in this.state.uuidStructure) {
                let uuid = this.state.uuidStructure[item]
                //Get array
                //Info is UUID of object
                let info = this.state.structure[uuid]
                items.push(
                    <Layout.Grid row key={item} width={info.width} style={{ marginRight: 20 }}>
                        <Layout.Grid col style={{ borderBottom: "1px solid black", paddingBottom: 15 }}>
                            <Layout.Grid width={info.width} style="center">
                                <p style={{ fontSize: 18, fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", display: "block", whiteSpace: "nowrap" }}>
                                    {info.label}
                                </p>
                            </Layout.Grid>

                        </Layout.Grid>
                        <Layout.Grid col style={{ paddingTop: 10 }}>
                            <Layout.Grid width={info.width}>
                                <InputGroup onChange={this.onInputName.bind(this, uuid)} value="" />
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>

                )
            }
            items.push(<Layout.Grid row key="extra" width={15}  ></Layout.Grid>)
            return items
        }
        render() {
            return <Layout.Grid row canvas style={{ height: "100%", }} >
                <Layout.Grid row height={120} >
                    <Layout.Grid col onWheel={(event) => { event.currentTarget.scrollLeft += 0.3 * event.deltaY }} className="scrollX" style={{ padding: 30, overflowX: 'auto', overflow: "overlay", height: 0, }}>
                        {this.renderExample()}
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid className="scrollY" style={{ overflowY: 'auto', overflow: "overlay", height: 0, background: "rgba(0,0,0,0.4)" }}>
                    <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {this.renderEditItems()}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Layout.Grid>
                <Layout.Grid col height={50} style={{ bottom: 0, margin: 0, padding: 10 }} background="gray">

                    <Layout.Grid width={30} height={30} background="white" style={{ borderRadius: 5 }}>
                        <Button className="pt-minimal" icon="add" onClick={this.onAddItem.bind(this)} />
                    </Layout.Grid>

                </Layout.Grid>

            </Layout.Grid>
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    class EntryMain extends React.Component {
        constructor() {
            super()
            this.state = {
                navbarTabId: null,
                users: {},
                inputValues: {},
                editing: false,
                baseStructure: {},
                localStructure: {},
                entryList: {}
            }
            this.eRefs = {
                input: null,
                submit: null,
            }
            this.iRefs = {}
        }
        componentDidMount() {
            //alert(this.props.uuid)
            let socketObject = imports.api.socket.use()
            this.socketObject = socketObject
            console.log(socketObject)
            socketObject.on("connect", () => {
                //alert("connected to entry")
                imports.api.auth.use(socketObject)
                imports.api.auth.vaild(socketObject, () => {
                    imports.api.page.usePage(socketObject, this.props.uuid)
                    socketObject.on("entry_updateStructure", ({ structure }) => {
                        console.log(structure)
                        this.setState({ localStructure: structure, baseStructure: structure })
                    })
                    socketObject.on("entry_userName", ({ name }) => {
                        this.setState({ username: name })
                    })
                    socketObject.on("entry_newUser", ({ uuid, name }) => {
                        if (imports.api.auth.uuid() != uuid) {
                            let users = this.state.users
                            users[uuid] = name

                            this.setState({ users, navbarTabId: imports.api.auth.uuid() })
                            socketObject.emit("entry_viewingUser", { uuid: imports.api.auth.uuid() })
                        }
                    })
                    socketObject.on("entry_removeUser", ({ uuid }) => {
                        if (imports.api.auth.uuid() != uuid) {
                            let users = this.state.users
                            users[uuid] = null
                            this.setState({ users })
                        }
                    })
                    socketObject.on("entry_viewingUpdate", ({ user, data }) => {
                        console.log("%cRECIEVING", "color: red; font-size: 40px")
                        console.log(this.state.inputValues)
                        let inputValues = this.state.inputValues
                        if (inputValues[user] == null) {
                            inputValues[user] = {}
                        }
                        inputValues[user] = data
                        this.setState({ inputValues })
                    })
                    socketObject.on("entry_listUpdate", (entries) => {
                        this.setState({ entryList: entries })
                    })
                })
            })
            let inputValues = this.state.inputValues
            inputValues[imports.api.auth.uuid()] = {}
            this.setState({ navbarTabId: imports.api.auth.uuid(), inputValues })
        }
        componentWillUnmount() {
            this.socketObject.close()
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.setState({ closeTab: true })
            }
        }
        async handleNavbarTabChange(navbarTabId) {
            console.log(navbarTabId)
            this.socketObject.emit("entry_viewingUser", { uuid: navbarTabId })
            this.setState({ navbarTabId })
        }
        async onEditClick() {
            if (this.state.editing) {
                this.setState({ editing: false })
                console.log(this.state.baseStructure)
                this.socketObject.emit("entry_updateOutline", { structure: this.state.baseStructure })
            } else {
                this.setState({ editing: true })
            }
        }
        async onInput(uuid, event) {
            //Check if the user is selected on its tab, if not disabled the InputBoxes
            if (this.state.navbarTabId == imports.api.auth.uuid()) {
                let value = event.currentTarget.value
                this.socketObject.emit("entry_updateData", { value: value, uuid: uuid })
                let inputValues = this.state.inputValues
                inputValues[imports.api.auth.uuid()][uuid] = value
                this.setState({ inputValues })
            }
            event.preventDefault()

        }
        async onFocusHidden() {
            this.eRefs.submit.focus()
        }
        async onEditorChange(structure) {
            console.log(structure)
            console.log("SETTING STATE")
            this.setState({ baseStructure: structure })
        }
        async onEntrySubmit() {
            let pass = true
            let user = imports.api.auth.uuid()
            let inputValues = this.state.inputValues
            if (inputValues[user] == null) {
                inputValues[user] = {}
            }
            let first = true
            for (let uuid in this.state.localStructure) {
                if (first == true) {
                    first = uuid
                }
                if (inputValues[user][uuid] == null) {
                    inputValues[user][uuid] = ""
                }
                let value = inputValues[user][uuid]
                if (value.length == 0) {
                    pass = false
                    this.iRefs[uuid].focus()
                    break
                }
            }
            if (pass) {
                console.log("SUBMMITING")
                this.iRefs[first].focus()
                this.socketObject.emit("entry_submitEntry", { entry: inputValues[user] })
                for (let uuid in this.state.localStructure) {

                    inputValues[user][uuid] = ""
                }
                this.setState({ inputValues })

            }
        }
        renderTabs() {
            if (this.state.editing == false) {
                let items = []
                items.push(<Tab id={imports.api.auth.uuid()} title="You" />)
                for (let user in this.state.users) {
                    if (this.state.users[user] != null) {
                        items.push(<Tab id={user} title={this.state.users[user]} />)
                    }
                }
                return items
            }
        }
        renderButton() {
            let icon = "edit"
            let style = {}
            if (this.state.editing) {
                icon = "tick"

            }
            return <Button className="pt-minimal" icon={icon} style={style} onClick={this.onEditClick.bind(this)} />
        }
        renderEditor() {
            let structure = this.state.localStructure
            if (this.state.editing) {
                return <EntryEditor structure={structure} onChange={this.onEditorChange.bind(this)} />
            }
        }
        renderEntryList() {

            let list = []
            let entries = this.state.entryList
            let loop = 0
            for (let entry in entries) {
                let background = "white"
                if (loop % 2 == 0) {
                    background = "lightgray"
                }
                let eList = []
                eList.push(<Layout.Grid width={100} style={{ marginRight: 20, fontSize: 17 }} >{entries[entry].name}</Layout.Grid>)
                for (let uuid in this.state.localStructure) {
                    let info = this.state.localStructure[uuid]
                    eList.push(
                        <Layout.Grid width={info.width} style={{ marginRight: 20, fontSize: 17 }}>
                            {entries[entry].entry[uuid]}
                        </Layout.Grid>
                    )
                }
                list.push(<Layout.Grid background={background} col height={50}>
                    {eList}
                </Layout.Grid>)
                loop++
            }
            return list
        }
        renderEntry() {
            let items = []
            //Are the inputs disabled?
            let disabled = false
            //Get User UUID
            let user = this.state.navbarTabId
            let inputValues = this.state.inputValues
            if (inputValues[user] == null) {
                inputValues[user] = {}
            }
            //Loop through all outlined objects,


            items.push(<Layout.Grid row key="name" width={100} style={{ marginRight: 20 }}>
                <Layout.Grid col style={{ borderBottom: "1px solid black", paddingBottom: 15 }}>
                    <Layout.Grid style="center">
                        <p style={{ fontSize: 18, fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", display: "block", whiteSpace: "nowrap" }}>
                            User
                        </p>
                    </Layout.Grid>

                </Layout.Grid>
                <Layout.Grid col style={{ paddingTop: 10 }} >
                    <Layout.Grid background="white" className="center" style={{ padding: 10 }} width="100%" height={30}>
                        <p>{this.state.username}</p>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>)
            for (let uuid in this.state.localStructure) {
                let info = this.state.localStructure[uuid]
                //If the client has imported data in yet, do so. (should be blank on boot)
                if (inputValues[user][uuid] == null) {
                    inputValues[user][uuid] = ""
                }
                let input = <InputGroup inputRef={ref => { this.iRefs[uuid] = ref }} onChange={this.onInput.bind(this, uuid)} value={inputValues[user][uuid]} />
                items.push(
                    <Layout.Grid row key={uuid} width={info.width} style={{ marginRight: 20 }}>
                        <Layout.Grid col style={{ borderBottom: "1px solid black", paddingBottom: 15 }}>
                            <Layout.Grid width={info.width} style="center">
                                <p style={{ fontSize: 18, fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", display: "block", whiteSpace: "nowrap" }}>
                                    {info.label}
                                </p>
                            </Layout.Grid>

                        </Layout.Grid>
                        <Layout.Grid col style={{ paddingTop: 10 }}>
                            <Layout.Grid width={info.width}>
                                {input}
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>

                )
            }
            if (!this.state.editing) {
                items.push(<Layout.Grid row>
                    <Layout.Grid col>

                    </Layout.Grid>
                    <Layout.Grid col style={{ paddingTop: 25 }}>
                        <Layout.Grid width={100} className="popout">
                            <Button elementRef={ref => { this.eRefs.submit = ref }} intent={Intent.SUCCESS} onClick={this.onEntrySubmit.bind(this)}> Submit</Button>
                            <a href="#" onFocus={this.onFocusHidden.bind(this)} style={{ fontWeight: "none", opacity: 0, textDecoration: "none" }}>_</a>
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>)
                return <Layout.Grid row canvas style={{ height: "100%" }} >
                    <Layout.Grid row height={120} >
                        <Layout.Grid col onWheel={(event) => { event.currentTarget.scrollLeft += 0.3 * event.deltaY }} className="scrollX" style={{ padding: 30, overflowX: 'auto', overflow: "overlay", height: 0, }}>
                            {items}
                        </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid row className="scrollY" style={{ overflowY: 'auto', overflow: "overlay", height: 0, paddingLeft: 30, borderTop: "2px solid gray" }}>
                        {this.renderEntryList()}
                    </Layout.Grid>
                </Layout.Grid>
            }
            return null
        }
        render() {
            let navStyle = {}
            if (this.state.editing) {
                navStyle = { background: "lightgray" }
            }
            return <Layout.Grid row height={this.props.height} style={{ position: "relative" }}>
                <Layout.Grid>

                    <QuitQuestion height={this.props.height + 100} isOpen={this.props.onClose} onClose={this.props.close} icon="cross">
                        <p>
                            Are you sure you wanna exit data collection? <br />
                            All current data in entry fields will be lost.
                         </p>
                    </QuitQuestion>

                    <Navbar style={navStyle}>
                        <Navbar.Group align={Alignment.LEFT}>
                            {/* controlled mode & no panels (see h1 below): */}
                            <Tabs
                                animate={false}
                                id="navbar"
                                large={true}
                                onChange={this.handleNavbarTabChange.bind(this)}
                                selectedTabId={this.state.navbarTabId}
                            >
                                {this.renderTabs()}
                            </Tabs>
                        </Navbar.Group>
                        <Navbar.Group align={Alignment.RIGHT}>
                            {this.renderButton()}
                        </Navbar.Group>
                    </Navbar>
                </Layout.Grid>
                <Layout.Grid>
                    {this.props.uuid}
                    {this.renderEditor()}
                    {this.renderEntry()}
                </Layout.Grid>
            </Layout.Grid>
        }
    }

    //Page loaded into core
    imports.api.page.register(EntryMain)
    imports.api.page.setOffset({ height: -100, width: 0 })
})
Observo.register(null, {
    GLOBAL: {},
})