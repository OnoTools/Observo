Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, NumericInput, RadioGroup, Radio, Alignment, Navbar, Overlay, Icon, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch, ContextMenu, Menu } = require("@blueprintjs/core")

    /**
     * Store - The main component thats not the sidebar of stores. It shows the name of the select
     * store and updates a user based on that store selected.
     */
    class Outline extends React.Component {
        constructor() {
            super()
            this.state = {
                outlineTabId: "structure",
                editField: {},
                fields: {}
            }
        }
        /**
         * When the React Component Mounts
         */
        componentDidMount() {

            //Grab the socket object from the props
            let socketObject = this.props.socketObject
            this.socketObject = socketObject

            //Make some events to be listened too
            socketObject.on("data_update_editField", (editField) => {
                this.setState({ editField })
                console.log(editField)
            })
            socketObject.on("data_fields", (fields) => {
                this.setState({ fields })
                console.log(fields)
                console.log(fields)
            })
        }
        //When the tab is selected
        async handleTabChange(outlineTabId) {
            this.setState({ outlineTabId })
        }
        async onNewField(outline) {
            this.socketObject.emit("data_newField", { outline })
        }


        renderFields() {
            let items = []
            for (let f in this.state.fields) {
                let field = this.state.fields[f]
                let name = field.name
                let type = field.type
                let required = field.require
                let locked = field.locked
                let status = field.status

                let isRequired = (r) => {
                    if (r) {
                        return <Icon icon="tick" iconSize={Icon.SIZE_LARGE} intent={Intent.SUCCESS} />
                    } else {
                        return <Icon icon="cross" iconSize={Icon.SIZE_LARGE} intent={Intent.DANGER} />
                    }
                }

                if (type != "number" || type != "string" || type != "image") {
                    type = "number"
                }

                let statusText = null;
                let background = null;
                if (status == "0") {
                    statusText = "PENDING"
                    background = "orange"
                }
                else if (status == "1") {
                    statusText = "ACTIVE"
                    background = "lightgreen"
                }
                else if (status == "2") {
                    statusText = "ARCHIVED"
                    background = "gray"
                }
                let buttonPadding = { marginLeft: 5 }

                items.push(<Layout.Grid col height={70} background={background} style={{ textAlign: "center" }}>
                    <Layout.Grid width={300} style={{ marginTop: 20 }}>{name}</Layout.Grid>
                    <Layout.Grid width={150} style={{ marginTop: 20 }}>
                        {type.toUpperCase()}
                    </Layout.Grid>
                    <Layout.Grid width={150} style={{ marginTop: 20 }}>
                        {isRequired(required)}
                    </Layout.Grid>
                    <Layout.Grid width={200} style={{ marginTop: 20 }}>
                        <Button className="pt-minimal" icon="edit" />
                        <Button className="pt-minimal" intent={Intent.DANGER} style={buttonPadding} icon="trash" />
                        <Button className="pt-minimal" intent={Intent.SUCCESS} style={buttonPadding} icon="tick" />
                    </Layout.Grid>
                    <Layout.Grid width={150} style={{ marginTop: 20 }}>{statusText}</Layout.Grid>
                </Layout.Grid>)
            }
            return items
        }
        renderOutline() {
            //TODO: Wrap in scrollX and scrollY
            if (this.state.outlineTabId == "structure") {
                let buttonPadding = { marginLeft: 5 }
                return <Layout.Grid row className="center" height="50%">
                    <Layout.Grid col height={50} background="lightblue" style={{ textAlign: "center" }}>
                        <Layout.Grid width={300}><h4>Name</h4></Layout.Grid>
                        <Layout.Grid width={150}><h4>Type</h4></Layout.Grid>
                        <Layout.Grid width={150}><h4>Required</h4></Layout.Grid>
                        <Layout.Grid width={200} background="lightgray"><h4>Actions</h4></Layout.Grid>
                        <Layout.Grid width={150} background="black"><h4 style={{ color: "white" }}>Status</h4></Layout.Grid>
                        <Layout.Grid></Layout.Grid>
                        <Layout.Grid width={50} style={{ paddingTop: 5 }}><Button className="pt-minimal" icon="add" onClick={this.onNewField.bind(this, this.props.outlineSelected)} /></Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid row className="scrollY" height={50}>
                        {this.renderFields()}
                    </Layout.Grid>
                </Layout.Grid>
            } else if (this.state.outlineTabId == "rules") {
                return <Layout.Grid row className="center" height="50%">
                    Rules here

                </Layout.Grid>
            }
            return null
        }
        render() {

            return <Layout.Grid>
                <Layout.Grid row>
                    <Layout.Grid height={50}>
                        <Navbar style={{ background: "gray" }}>
                            <Navbar.Group align={Alignment.LEFT}>
                                <h3 style={{ marginRight: 50 }}>{this.props.name}</h3>
                                <Tabs

                                    animate={false}
                                    id="data_tabs"
                                    large={true}
                                    onChange={this.handleTabChange.bind(this)}
                                    selectedTabId={this.state.outlineTabId}>
                                    <Tab id="structure" title="Structure"></Tab>
                                    <Tab id="rules" title="Rules"></Tab>
                                </Tabs>
                            </Navbar.Group>
                            <Navbar.Group align={Alignment.RIGHT}>
                                <Button className="pt-minimal" icon="cog" />
                            </Navbar.Group>
                        </Navbar>
                    </Layout.Grid>
                    {this.renderOutline()}
                    <Layout.Grid row className="center" height="50%">
                        <Store />
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>

        }
    }
    class Store extends React.Component {
        constructor() {
            super()
        }
        render() {
            return <Layout.Grid>
                <Layout.Grid row>
                    <Layout.Grid height={50}>
                        <Navbar style={{ background: "gray" }}>
                            <Navbar.Group align={Alignment.LEFT}>
                                Store
                        </Navbar.Group>
                            <Navbar.Group align={Alignment.RIGHT}>
                                <Button className="pt-minimal" icon="cog" />
                            </Navbar.Group>
                        </Navbar>
                    </Layout.Grid>
                    <Layout.Grid row className="center" height="50%">

                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        }

    }
    class Data extends React.Component {
        constructor() {
            super()
            this.state = {
                outlineName: "",
                outlineSelected: null,
                storeSelected: null,

                outlinesNames: {},
                outlineLocked: {},

                storesNames: {},

                renameOutline: {},
                renameStore: {},
            }
        }
        /**
         * componentWillReceiveProps
         * - Used for when the page gets closed
         * @param {Props} nextProps 
         */
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                imports.api.socket.end(this.socketObject)
                this.props.close()
            }
        }
        /**
         * componentDidMount
         */
        componentDidMount() {

            //Make the socket and connect to server
            let socketObject = imports.api.socket.use()
            this.socketObject = socketObject
            //Connect to the server event
            socketObject.on("connect", () => {
                //Use the AUTH API from the socket
                imports.api.auth.use(socketObject)
                //Vaildate the authetication
                imports.api.auth.vaild(socketObject, () => {
                    //Now select the page via the properties passed down
                    imports.api.page.usePage(socketObject, this.props.uuid)

                    //The listings of all STORES
                    socketObject.on("data_outlines", (outlines) => {
                        try {
                            console.log(outlines)
                            this.setState({ outlinesNames: outlines.name, outlineLocked: outlines.locked })
                        } catch (e) {
                            //TODO: Change to notification
                        }
                    })
                    socketObject.on("data_stores", (stores) => {
                        console.log(stores)
                        try {
                            this.setState({ storesNames: stores })
                        } catch (e) {
                            //TODO: Change to notification
                        }
                    })
                    socketObject.on("data_editing_renameOutline", (outline) => {
                        try {
                            this.setState({ renameOutline: outline })
                        } catch (e) {
                            //TODO: Change to notification
                        }
                    })
                    socketObject.on("data_editing_renameStore", (store) => {
                        console.log(store)
                        try {
                            this.setState({ renameStore: store })
                        } catch (e) {
                            //TODO: Change to notification
                        }
                    })
                })
            })
        }
        /**
         * onNewOutline - Creates a new outline where list of stores can be used on
         */
        async onNewOutline() {
            this.socketObject.emit("data_newOutline")
        }
        async onNewStore() {
            if (this.state.outlineSelected != null) {
                this.socketObject.emit("data_newStore", { outline: this.state.outlineSelected })
            }
        }
        /**
         * selectOutline - When a outline is selected
         * @param {uuid} store 
         */
        async selectOutline(outline) {
            //console.log("CLICKED STORE")
            this.setState({ outlineSelected: outline })
            this.socketObject.emit("data_select", { outline })
        }
        async selectStore(outline, store) {
            this.setState({ storeSelected: outline })
            this.socketObject.emit("data_select", { outline, store })
        }
        /**
         * onOutlineName - The InputGroup event for text updating used for editing a OUTLINE name
         * @param {event} event 
         */
        async onOutlineName(event) {
            this.setState({ outlineName: event.currentTarget.value })
        }
        /**
        * onStoreName - The InputGroup event for text updating used for editing a STORE name
        * @param {event} event 
        */
        async onStoreName(event) {
            this.setState({ storeName: event.currentTarget.value })
        }
        /**
         * editOutline - This allows a store to be edited. (from button click)
         * @param {uuid} store 
         * @param {Boolean} finished 
         */
        async editOutline(outline, update) {
            if (update) {
                let name = this.state.outlineName
                this.socketObject.emit("data_update_renameOutline", { outline, name })
            } else {
                this.socketObject.emit("data_renameOutline", { outline })
            }
            this.setState({ outlineName: this.state.outlinesNames[outline] })
        }
        /**
         * editOutline - This allows a store to be edited. (from button click)
         * @param {uuid} store 
         * @param {Boolean} finished 
         */
        async editStore(outline, store, update) {
            if (update) {
                let name = this.state.storeName
                this.socketObject.emit("data_update_renameStore", { outline, store, name })
            } else {
                this.socketObject.emit("data_renameStore", { outline, store })
            }
            this.setState({ storeName: this.state.storesNames[outline][store] })
        }

        renderStores(outline, background) {
            //Check if its a valid outline
            if (this.state.outlinesNames[outline] != null) {
                console.log("PASSED 1")
                if (this.state.storesNames[outline] != null) {
                    let items = []
                    console.log("PASSED 2")
                    for (let store in this.state.storesNames[outline]) {
                        let disabled = false //By default the button is enabled, so disabled is going to be false

                        let selectedStyle = Intent.NONE
                        if (this.state.storeSelected != null) { //If the selected store is in the state and it equals the looped store, make it green
                            if (this.state.storeSelected == store) {
                                selectedStyle = Intent.SUCCESS
                            }
                        }

                        //Default button and text state
                        let edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="edit" disabled={disabled} onClick={this.editStore.bind(this, outline, store, false)} /> </Layout.Grid>
                        let state = <Button onClick={this.selectStore.bind(this, store)} intent={selectedStyle}>{this.state.storesNames[outline][store]}</Button>

                        //Editing Checking
                        if (this.state.renameStore[store] != undefined) {
                            //If the user is NOT the one editing the STORE, make it orange and make the edit button disabled
                            if (imports.api.auth.uuid() != this.state.renameStore[store]) {
                                disabled = true
                                edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="tick" disabled={disabled} intent={Intent.PRIMARY} onClick={this.editStore.bind(this, outline, store, false)} /> </Layout.Grid>
                                //If the user IS editing the store, make it show a text box, and also modify the edit button to a green tick box
                            } else if (imports.api.auth.uuid() == this.state.renameStore[store]) {
                                edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="tick" disabled={disabled} intent={Intent.SUCCESS} onClick={this.editStore.bind(this, outline, store, true)} /> </Layout.Grid>
                                state = <InputGroup value={this.state.storeName} onChange={this.onStoreName.bind(this)}></InputGroup>
                            }
                        }

                        //Add that store to a array and met it 
                        items.push(
                            <Layout.Grid col style={{ paddingLeft: 15, marginTop: 10, padding: 5 }}>
                                <Layout.Grid>
                                    {state}
                                </Layout.Grid>
                                {edit}
                            </Layout.Grid>
                        )
                    }
                    return items
                }
            }
            return null;
        }
        /**
         * RenderStoreList - Renders the store list
         */
        renderOutlineList() {
            let items = [] //List of all outlines
            let loop = 0 //Amount of the outlines
            for (let outline in this.state.outlinesNames) {
                let disabled = false //By default the button is enabled, so disabled is going to be false
                let background = "gray" //Default color for the background
                if (loop % 2 == 0) { //Every other outline lets swap the background color
                    background = "lightgray"
                }
                loop++ //Add to the loop
                //Make a copy of background

                let bk = background
                let add = null

                let stores = null
                //Default intent type of the select STORE
                let selectedStyle = Intent.NONE
                let outlineStyle = { paddingLeft: 15, marginTop: 10, padding: 5 }
                if (this.state.outlineSelected != null) { //If the selected outline is in the state and it equals the looped outline, make it green
                    if (this.state.outlineSelected == outline) {
                        selectedStyle = Intent.SUCCESS
                        outlineStyle.borderBottom = "1px solid black"
                        add = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="add" intent={Intent.PRIMARY} onClick={this.onNewStore.bind(this)} /></Layout.Grid>
                        stores = this.renderStores(outline, background)
                    }
                }

                //Default button and text state
                let edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="edit" disabled={disabled} onClick={this.editOutline.bind(this, outline, false)} /> </Layout.Grid>
                let state = <Button onClick={this.selectOutline.bind(this, outline)} intent={selectedStyle}>{this.state.outlinesNames[outline]}</Button>

                //Editing Checking
                if (this.state.renameOutline[outline] != undefined) {
                    //If the user is NOT the one editing the STORE, make it orange and make the edit button disabled
                    if (imports.api.auth.uuid() != this.state.renameOutline[outline]) {
                        disabled = true
                        edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="tick" disabled={disabled} intent={Intent.WARNING} onClick={this.editOutline.bind(this, outline, false)} /> </Layout.Grid>
                        //If the user IS editing the outline, make it show a text box, and also modify the edit button to a green tick box
                    } else if (imports.api.auth.uuid() == this.state.renameOutline[outline]) {
                        edit = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="tick" disabled={disabled} intent={Intent.SUCCESS} onClick={this.editOutline.bind(this, outline, true)} /> </Layout.Grid>
                        state = <InputGroup value={this.state.outlineName} onChange={this.onOutlineName.bind(this)}></InputGroup>
                    }
                }



                //Push all the items into a list so it can be rendered
                items.push(<Layout.Grid width="90%" row background={background} style={{ margin: 10, padding: 5, borderRadius: 3 }}>
                    <Layout.Grid style={outlineStyle} background={background}>
                        <Layout.Grid col style={{ paddingLeft: 15, marginTop: 10, padding: 5 }}>
                            <Layout.Grid>
                                {state}
                            </Layout.Grid>
                            {edit}
                            {add}
                        </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid style={{ paddingLeft: 15, padding: 5 }} >
                        {stores}
                    </Layout.Grid>
                </Layout.Grid>)
            }
            //Return it to the render
            return items
        }
        renderOutline() {
            if (this.state.outlineSelected == null) {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>Select a STORE</p>
                </div>
            } else {
                let name = ""
                if (this.state.outlinesNames[this.state.outlineSelected] != null) {
                    name = this.state.outlinesNames[this.state.outlineSelected]
                }
                return <Outline outlineSelected={this.state.outlineSelected} name={name} socketObject={this.socketObject} />
            }
        }
        render() {
            return <Layout.Grid canvas>
                <Layout.Grid background="white" width={400} row>
                    <Layout.Grid height={50} col>
                        <Layout.Grid style={{ paddingLeft: 30 }}><h3>Outlines & Stores</h3></Layout.Grid>
                        <Layout.Grid width={30} style={{ marginTop: 10, marginRight: 30 }} onClick={this.onNewOutline.bind(this)}><Button className="pt-minimal" icon="add" /> </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid className="scrollY" background="white" height={this.props.height - 100} width={400} style={{ overflowY: 'auto', overflow: "overlay" }}>
                        {this.renderOutlineList()}
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid>
                    {this.renderOutline()}
                </Layout.Grid>
            </Layout.Grid>
        }
    }


    imports.api.page.register(Data)

})
Observo.register(null, {
    GLOBAL: {},
})