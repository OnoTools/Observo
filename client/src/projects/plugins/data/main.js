Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    let { Tab, Tabs, ProgressBar, NumericInput, RadioGroup, Radio, Alignment, Navbar, Overlay, Icon, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch, ContextMenu, Menu } = require("@blueprintjs/core")




    class Store extends React.Component {
        constructor() {
            super()
            this.state = {
                storeTabId: "outline"
            }
        }
        componentDidMount() {
            let socketObject = this.props.socketObject

        }
        renderOutline() {
            //TODO: Wrap in scrollX and scrollY
            if (this.state.storeTabId == "outline") {
                return <Layout.Grid canvas row className="center">
                    <Layout.Grid col height={50} background="lightblue" style={{ textAlign: "center" }}>
                        <Layout.Grid width={150}><h4>#</h4></Layout.Grid>
                        <Layout.Grid width={150}><h4>Type</h4></Layout.Grid>
                        <Layout.Grid width={150}><h4>Primary</h4></Layout.Grid>
                        <Layout.Grid width={150}><h4>Related</h4></Layout.Grid>
                        <Layout.Grid width={150} background="lightgray"><h4>Actions</h4></Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid col height={70} background="white" style={{ textAlign: "center" }}>
                        <Layout.Grid width={150} style={{ marginTop: 20 }}>1</Layout.Grid>
                        <Layout.Grid width={150} style={{ marginTop: 20 }}>Number</Layout.Grid>
                        <Layout.Grid width={150} style={{ marginTop: 20 }}><Icon icon="tick" intent={Intent.SUCCESS} /></Layout.Grid>
                        <Layout.Grid width={150} style={{ marginTop: 20 }}>
                            <select defaultValue="none">
                                <option value="none">Select Event...</option>
                            </select>
                        </Layout.Grid>
                        <Layout.Grid width={150} style={{ marginTop: 20 }}>
                            <Button className="pt-minimal" icon="edit" />
                            <Button className="pt-minimal" intent={Intent.DANGER} icon="trash" />
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
            }
            return null
        }


        async handleTabChange(storeTabId) {
            this.setState({ storeTabId })
        }
        render() {
            if (this.props.selectedStore != null && this.props.selectedStore != "") {
                return <Layout.Grid>
                    <Navbar style={{ background: "gray" }}>
                        <Navbar.Group align={Alignment.LEFT}>
                            <h3 style={{ marginRight: 50 }}>{this.props.name}</h3>
                            <Tabs

                                animate={false}
                                id="data_tabs"
                                large={true}
                                onChange={this.handleTabChange.bind(this)}
                                selectedTabId={this.state.storeTabId}>
                                <Tab id="outline" title="Outline"></Tab>
                                <Tab id="viewer" title="Viewer"></Tab>
                            </Tabs>
                        </Navbar.Group>
                        <Navbar.Group align={Alignment.RIGHT}>
                            <Button className="pt-minimal" icon="cog" />
                        </Navbar.Group>
                    </Navbar>
                    {this.renderOutline()}
                </Layout.Grid>
            } else {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>Select a STORE</p>
                </div>
            }
        }
    }




    //let a = imports.api.socket.use()
    class Data extends React.Component {
        constructor() {
            super()
            this.state = {
                storeList: {},
                storeEdit: {},
                storeName: "",
                storeSelected: ""
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
                    socketObject.on("data_storeListings", (stores) => {
                        console.log(stores)
                        this.setState({ storeList: stores })
                    })
                    //The name editing of the stores TODO: Rename it?
                    socketObject.on("data_editingStore", (stores) => {
                        console.log(stores)
                        //alert("edit")
                        this.setState({ storeEdit: stores })
                    })
                })
            })
        }
        /**
         * onNewStore - Creates a new store (no name, can be edited tho)
         */
        async onNewStore() {
            this.socketObject.emit("data_newStore")
        }
        /**
         * selectStore - When a store is selected for viewing and modifing
         * @param {uuid} store 
         */
        async selectStore(store) {
            console.log("CLICKED STORE")
            this.setState({ storeSelected: store })
        }
        /**
         * onStoreName - The InputGroup event for text updating used for editing a STORES name
         * @param {event} event 
         */
        async onStoreName(event) {
            this.setState({ storeName: event.currentTarget.value })
        }
        /**
         * editStore - This allows a store to be edited. (from button click)
         * @param {uuid} store 
         * @param {Boolean} finished 
         */
        async editStore(store, finished) {
            if (finished) {
                this.socketObject.emit("data_updateStore", { store, name: this.state.storeName })
            } else {

                this.setState({ storeName: this.state.storeList[store] })
            }
            this.socketObject.emit("data_editStore", { store })
        }
        /**
         * RenderStoreList - Renders the store list
         */
        renderStoreList() {
            let items = [] //List of all stores
            let loop = 0 //Amount of the stores
            for (let store in this.state.storeList) {
                let disabled = false //By default the button is enbabled, so disabled is going to be false
                let background = "gray" //Default color for the background
                if (loop % 2 == 0) { //Every other store lets swap the background color
                    background = "lightgray"
                }
                loop++ //Add to the loop

                //Default intent type of the select STORE
                let selectedStyle = Intent.NONE
                if (this.state.storeSelected != null) { //If the selected store is in the state and it equals the looped store, make it green
                    if (this.state.storeSelected == store) {
                        selectedStyle = Intent.SUCCESS
                    }
                }

                //Default button and text state
                let button = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="edit" disabled={disabled} onClick={this.editStore.bind(this, store, false)} /> </Layout.Grid>
                let state = <Button onClick={this.selectStore.bind(this, store)} intent={selectedStyle}>{this.state.storeList[store]}</Button>

                //Editing Checking
                if (this.state.storeEdit[store] != undefined) {
                    //If the user is NOT the one editing the STORE, make it orange and make the edit button disabled
                    if (imports.api.auth.uuid() != this.state.storeEdit[store]) {
                        background = "orange"
                        disabled = true
                        //If the user IS editing the store, make it show a text box, and also modify the edit button to a green tick box
                    } else if (imports.api.auth.uuid() == this.state.storeEdit[store]) {
                        button = <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="tick" disabled={disabled} intent={Intent.SUCCESS} onClick={this.editStore.bind(this, store, true)} /> </Layout.Grid>
                        background = "orange"
                        state = <InputGroup value={this.state.storeName} onChange={this.onStoreName.bind(this)}></InputGroup>
                    }
                }
                //Push all the items into a list so it can be rendered
                items.push(<Layout.Grid width={300} col background={background} style={{ margin: 10, padding: 5, borderRadius: 3 }}>
                    <Layout.Grid>
                        {state}
                    </Layout.Grid>
                    {button}
                    <Layout.Grid width={30} style={{ marginRight: 10 }}><Button className="pt-minimal" icon="cross" intent={Intent.DANGER} onClick={this.selectStore.bind(this, store)} /></Layout.Grid>
                </Layout.Grid>)
            }
            //Return it to the render
            return items
        }
        render() {
            let name = ""
            if (this.state.storeList[this.state.storeSelected] != null) {
                name = this.state.storeList[this.state.storeSelected]
            }
            return <Layout.Grid canvas>
                <Layout.Grid background="white" width={400} row>
                    <Layout.Grid height={50} col>
                        <Layout.Grid style={{ paddingLeft: 30 }}><h3>Stores</h3></Layout.Grid>
                        <Layout.Grid width={30} style={{ marginTop: 10, marginRight: 30 }} onClick={this.onNewStore.bind(this)}><Button className="pt-minimal" icon="add" /> </Layout.Grid>
                    </Layout.Grid>
                    <Layout.Grid className="scrollY" background="white" height={400} width={400} style={{ overflowY: 'auto', overflow: "overlay" }}>
                        {this.renderStoreList()}
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid>
                    <Store selectedStore={this.state.storeSelected} name={name} socketObject={this.socketObject} />
                </Layout.Grid>
            </Layout.Grid>
        }
    }


    imports.api.page.register(Data)

})
Observo.register(null, {
    GLOBAL: {},
})