import React, { Component } from 'react'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Alignment, ButtonGroup, Menu, MenuItem, Classes } from "@blueprintjs/core";
import { Window, TitleBar, Text } from 'react-desktop/windows';
import { Layout } from "@importcore/crust"
import { GlobalContext } from "global-context"

import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import 'brace/theme/solarized_dark';

import { AppToaster } from "./toaster";
import EventWindow from "./window"
let ProjectWindow = new EventWindow()

import DocTabs from "./components/doctabs/doctabs.jsx"
import Sidebar from "./components/sidebar.jsx"
import ErrorBoundary from "./components/error.jsx"


const managerLocal = require("import-window")
import io from 'socket.io-client';
import events from 'events'

require("babel-polyfill")

let DefinedManager = require("./defined")

export default class App extends Component {
    constructor() {
        super();
        //Create a global event listner, used by the GlobalContext Provider
        var objectEvent = new events.EventEmitter();

        //States
        this.state = {
            tabs: [],
            selectedTab: null,
            removeTab: null,
            closeTab: {},
            openTabs: {},
            globalProvider: {
                globalEvent: objectEvent
            }
        }

        /**
         * Defined - Defined is a multi purpose plugin and API loader, made for Observo. 
         * The code below defines:
         * - Code Tranformation (JSX for React, Rest Spread, & Async Options) 
         * - 
         */
        let manager = new DefinedManager()
        manager.setDefinedID("Observo") //Custom NAMESPACE
        var { transform } = require("babel-core");
        manager.transformCode((code, name) => {
            code = `//# sourceURL=${name.toUpperCase()}\n
            ${code}`
            let newCode = transform(code, {
                "presets": [require.resolve("babel-preset-env"), require.resolve("babel-preset-react")],
                "plugins": [
                    require.resolve("babel-plugin-transform-async-to-generator"),
                    require.resolve("babel-plugin-transform-object-rest-spread")
                ],
            }).code
            return newCode
        })
        this.api = manager.addDefined("API", "./api", true, ["CLIENT"])
        this.plugin = manager.addDefined("PLUGINS", "./plugins", false, [])

        manager.onAppReady(() => {
            console.log("%cOBSERVO", "color: cyan; font-size: 50px")
            console.log("%cMade by OnoTools [@ImportProgram]", "font-weight: bold; font-size: 24px")
        })
    }
    /**
     * addTab - Adds a tab to the DocTab Component
     */
    async addTab() {
        let name = this.state.text
        let tabs = this.state.tabs
        tabs.push({ title: name })
        this.setState({ tabs: tabs })
    }
    /**
     * 
     * @param {*} name 
     * @param {*} option 
     */
    async forceCloseTab(name, option) {
        if (!option) {
            let openTabs = this.state.openTabs
            openTabs[name] = null
            let closeTab = this.state.closeTab
            closeTab[name] = false
            this.setState({ removeTab: name, openTabs: openTabs, closeTab })
        } else {
            let closeTab = this.state.closeTab
            closeTab[name] = false
            this.setState({ closeTab })
        }
    }
    /**
     * onDocTabChange - When the tabs get changed
     * @param {Object} tabs 
     * @param {String} selected 
     */
    onDocTabChange(tabs, selected) {
        this.setState({ tabs: tabs, removeTab: null })
    }
    /**
     * onTabClose - When a tab is closed
     * @param {String} name Name of the object, also the title 
     */
    onTabClose(name) {
        console.log("CLOSING")
        console.log(name)
        let closeTab = this.state.closeTab
        closeTab[name] = true
        this.setState({ closeTab })
    }
    /**
     * onSelected - When a tab becomes selected
     * @param {String} name 
     */
    onSelected(name) {
        this.setState({ selectedTab: name })
    }
    /**
     * componentDidMount - React Lifecycle Method
     */
    componentDidMount() {

        /**
         * Authentication Process
         * - The code below connects to the Auth system (/core/ of the server) and trades:
         *  - AuthKey
         *  - UUID
         *  - SessionKey (@returns)
         * 
         * This also triggers the
         * @event SOCKET:connected Emits when the core is fully connected and can be used.
         */
        let args = managerLocal.parseArgs()
        let socketObject = io.connect(`http://${args.ip}/core/`)
        socketObject.on("connect", () => {
            this.state.globalProvider.globalEvent.emit("SOCKET:connected", { global: io, client: socketObject, clientPlugins: this.plugin })
            socketObject.emit("auth_signIn", { authKey: args.authKey })
            socketObject.on("auth_vaildSignin", (data) => {
                this.api.auth.services.API.updateAuth(data)
                socketObject.emit("core_getProject", { project: args.project })
            })
        })
        /**
         * @event PLUGIN:open This is called by the sidebar tree view, it the click event when a page needs to open a plugin  
         */
        this.state.globalProvider.globalEvent.on("PLUGIN:open", (nodeData) => {
            if (!nodeData.hasCaret) {
                let name = nodeData.label
                if (nodeData.prefix) {
                    name = `${nodeData.prefix}: ${name}`
                }
                let openTabs = this.state.openTabs
                if (openTabs[name] == null) {
                    openTabs[name] = { plugin: nodeData.plugin, uuid: nodeData.uuid }
                    let tabs = this.state.tabs
                    tabs.push({ title: name })
                    this.setState({ tabs: tabs, openTabs: openTabs })
                } else {
                    this.setState({ selectedTab: name })
                }
            }
        })
        /**
         * Viewing Fix for Page Area
         *  - Because the nature of flex box, we use this very easy method to assume the real width and height
         * of the children. It updates on resize, but can be buggy. Also uses a lot of chrome resources, which
         * I can not do much about :/
         */
        let height = document.documentElement.clientHeight - 30
        let width = document.documentElement.clientWidth - 200
        this.setState({ areaHeight: height, areaWidth: width })
        /**
         * ProjectWindow - The Electron Window Manager (window.js)
         */
        ProjectWindow.onResize(() => {
            let height = document.documentElement.clientHeight - 30
            let width = document.documentElement.clientWidth - 200
            this.setState({ areaHeight: height, areaWidth: width })
        })
    }
    /**
     * renderPages - Renders all pages to the screen.
     * - Renders the custom PLUGIN OBJECT to the screen. If not selected
     * the plugin will be render with "display: none" and not be shown, 
     * but still be in the background. This is because I don't want to create
     * new socket event handler each time a user goes between a tab.
     */
    renderPages() {
        let items = []
        for (let tab in this.state.openTabs) {
            let openPlugin = this.state.openTabs[tab]
            if (openPlugin != null) {
                let style = { display: "none" }
                if (tab == this.state.selectedTab) {
                    console.log(this.api.page.services.API.getHeightOffset(openPlugin.plugin))
                    console.log(this.api.page.services.API.getWidthOffset(openPlugin.plugin))
                    style = { height: (this.state.areaHeight + this.api.page.services.API.getHeightOffset(openPlugin.plugin)), width: (this.state.areaWidth + this.api.page.services.API.getWidthOffset(openPlugin.plugin))}
                }
                let CustomObject = this.api.page.services.API.getPage(openPlugin.plugin)
                let closeTab = this.state.closeTab
                if (closeTab[tab] == null) {
                    closeTab[tab] = false
                } else {
                    console.log("REAL")
                    console.log(this.state.closeTab[tab])
                }
                items.push(
                    <div key={tab} style={style}>
                        <ErrorBoundary onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)}>
                            <CustomObject locale="en" height={(this.state.areaHeight + this.api.page.services.API.getHeightOffset(openPlugin.plugin))} width={(this.state.areaWidth + this.api.page.services.API.getWidthOffset(openPlugin.plugin))} uuid={openPlugin.uuid} onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)} />
                        </ErrorBoundary>

                    </div>)
            }

        }
        return items
    }
    /**
     * render - React Method
     */
    render() {
        const options = {
            selectOnLineNumbers: true
        };
        return (
            <Window color="rgba(0, 153, 191, 0)" background="rgba(0, 153, 191, 1)">
                <TitleBar background="#00acd7" title={<span className="observo-text">OBSERVO</span>} controls />
                <GlobalContext.Provider value={this.state.globalProvider}>
                    <Layout.Grid canvas>
                        <Layout.Grid col>
                            {/*Sidebar*/}
                            <Sidebar />
                            {/*User Bar*/}
                            <Layout.Grid row>
                                <Layout.Grid col height="50px">

                                    {/*Doctabs*/}
                                    <Layout.Grid background="lightblue">
                                        <DocTabs key="tabs" tabs={this.state.tabs} selected={this.state.selectedTab} remove={this.state.removeTab} onChange={this.onDocTabChange.bind(this)} onSelect={this.onSelected.bind(this)} onClose={this.onTabClose.bind(this)} />
                                    </Layout.Grid>
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
                                    {this.renderPages()}
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                </GlobalContext.Provider>
            </Window>

        );

    }
}

