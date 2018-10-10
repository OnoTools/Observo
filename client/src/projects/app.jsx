import React, { Component } from 'react'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Alignment, ButtonGroup, Menu, MenuItem, Classes } from "@blueprintjs/core";
import { Window, TitleBar, Text } from 'react-desktop/windows';
import { Layout } from "crust"
import { GlobalContext } from "global-context"
import { AppToaster } from "./toaster";
import DocTabs from "./components/doctabs/doctabs.jsx"
import Sidebar from "./components/sidebar.jsx"
const managerLocal = require("import-window")
import io from 'socket.io-client';
import events from 'events'
require("babel-polyfill")

let DefinedManager = require("./defined")



export default class App extends Component {
    constructor() {
        super();

        var objectEvent = new events.EventEmitter();
        this.state = {
            test: null,
            tabs: [],
            globalProvider: {
                globalEvent: objectEvent
            }
        }
        let manager = new DefinedManager()
        manager.setDefinedID("Observo") //Custom NAMESPACE
        let api = manager.addDefined("API", "./api", true, ["CLIENT"])
        this.plugin = manager.addDefined("PLUGINS", "./plugins", false, [])
        let self = this
        manager.onAppReady(() => {
            console.log(api)
            self.setState({ test: api.page.services.API.getPage("example") })
        })
    }

    addTab() {
        let name = this.state.text
        let tabs = this.state.tabs
        tabs.push({ title: name })
        this.setState({ tabs: tabs })
    }
    docTabChange(tabs, selected) {
        console.log("CHANGE")
        console.log(tabs)
        console.log(selected)
        this.setState({ tabs: tabs })
    }
    closeTab(name) {
        console.log(name)
    }
    onSelected(name) {
        console.log(name)
    }

    btnClick() {
        /*
        notifier.notify(
            {
              title: 'Observo',
              message: 'Update is Ready!',
              sound: true, // Only Notification Center or Windows Toasters
              wait: true // Wait with callback, until user action is taken against notification
            },
            function(err, response) {
              // Response is response from notification
            }
          );*/
        AppToaster.show({ message: "Toasted." });
    }

    updateText(event) {
        this.setState({ text: event.target.value })
    }

    componentDidMount() {
        let args = managerLocal.parseArgs()
        let socketObject = io.connect(`http://${args.ip}/core/`)
        socketObject.on("connect", () => {
            this.state.globalProvider.globalEvent.emit("SOCKET:connected", {global: io, client: socketObject})
            socketObject.emit("auth_signIn", { authKey: args.authKey })
            socketObject.on("auth_vaildSignin", (data) => {
                console.log("VAILD")
                console.log(args.project)
                socketObject.emit("core_getProject", {project: args.project})
            })
            
        })
    }

    render(props, state) {
        const options = {
            selectOnLineNumbers: true
        };
        return (
            <Window color="rgba(0, 153, 191, 0)" background="rgba(0, 153, 191, 1)">
                <TitleBar background="#00acd7" title={<span className="observo-text">OBSERVO</span>} controls />
                <GlobalContext.Provider value={this.state.globalProvider}>
                    <Layout.Grid canvas>
                        <Layout.Grid row>
                            {/*Sidebar*/}
                            <Sidebar />
                            {/*User Bar*/}
                            <Layout.Grid col>
                                <Layout.Grid row height="50px">

                                    {/*Doctabs*/}
                                    <Layout.Grid background="lightblue">
                                        <DocTabs key="tabs" tabs={this.state.tabs} onChange={this.docTabChange.bind(this)} onSelect={this.onSelected.bind(this)} onClose={this.closeTab.bind()} />
                                    </Layout.Grid>5
                                    <Layout.Grid width="120px">
                                        <Navbar>
                                            <Navbar.Group align={Alignment.LEFT}>
                                                <Button className="pt-minimal" icon="user" />
                                                <Button className="pt-minimal" icon="notifications" />
                                                <Button className="pt-minimal" icon="cog" />
                                            </Navbar.Group>
                                        </Navbar>
                                    </Layout.Grid>
                                </Layout.Grid>
                                <Layout.Grid>
                                    <Button onClick={this.addTab.bind(this)} style={{ width: '100px' }}>+</Button>
                                    <input className="pt-input" type="text" placeholder="Text input" onChange={this.updateText.bind(this)} dir="auto" />
                                    {this.state.test}
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                </GlobalContext.Provider>
            </Window>

        );

    }
}

