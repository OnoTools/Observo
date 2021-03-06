/**
 * Observo Project Window
 * 
 * This is where all the plugins from a plugin pack get loaded.
 * Also logic for settings, and user authentications are located in here as well.
 * 
 * @author ImportProgram
 */



import React, { Component } from 'react'
import { Button, Checkbox, ProgressBar, Navbar, Alignment, ButtonGroup, Menu, MenuItem, Classes } from "@blueprintjs/core";
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
import Settings from "./components/settings.jsx"

const managerLocal = require("import-window")
import io from 'socket.io-client';
import events from 'events'

require("babel-polyfill")

let DefinedManager = require("./defined")


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
var DEFINED_API = manager.addDefined("API", "./api", true, ["CLIENT"])
var DEFINED_PLUGIN = manager.addDefined("PLUGINS", "./plugins", false, [])




manager.isLoaded((section, name, time) => {
    console.log(section)
    console.log(name)
    console.log(time)
})

class PluginRender extends Component {
    constructor() {
        super()
        //States
        this.state = {
            tabs: [],
            selectedTab: null,
            removeTab: null,
            closeTab: {},
            openTabs: {}
        }
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
            console.log("closing o")
            let openTabs = this.state.openTabs
            openTabs[name] = null
            let closeTab = this.state.closeTab
            closeTab[name] = false
            this.setState({ removeTab: name, openTabs: openTabs, closeTab })
        } else {
            console.log("closing e")
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
            this.props.globalEvent.emit("SOCKET:connected", { global: io, client: socketObject, clientPlugins: DEFINED_PLUGIN })
            socketObject.emit("auth_signIn", { authKey: args.authKey })
            socketObject.on("auth_vaildSignin", (data) => {
                DEFINED_API.auth.services.API.updateAuth(data)
                socketObject.emit("core_getProject", { project: args.project })
            })
            socketObject.on("disconnect", () => {
                console.log("disconctttted")
            })
        })
        /**
         * @event PLUGIN:open This is called by the sidebar tree view, it the click event when a page needs to open a plugin  
         */
        this.props.globalEvent.on("PLUGIN:open", (nodeData) => {
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
    openBuiltIn(name) {
        let openTabs = this.state.openTabs
        if (openTabs[name] == null) {
            openTabs[name] = { builtIn: name, uuid: name }
            let tabs = this.state.tabs
            tabs.push({ title: name })
            this.setState({ tabs: tabs, openTabs: openTabs })
        } else {
            this.setState({ selectedTab: name })
        }
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
            let openTab = this.state.openTabs[tab]
            //Check if its a real plugin being rendered
            if (openTab != null) {
                if (openTab.plugin != null) {
                    let style = { display: "none" }

                    //If this is the tab that's selected
                    if (tab == this.state.selectedTab) {
                        style = { height: (this.state.areaHeight + DEFINED_API.page.services.API.getHeightOffset(openTab.plugin)), width: (this.state.areaWidth + DEFINED_API.page.services.API.getWidthOffset(openTab.plugin)) }
                    }
                    //Now find the custom object. If this fails the error boundary will cover it.
                    let PluginObject = DEFINED_API.page.services.API.getPage(openTab.plugin)
                    //What tab is being closed
                    let closeTab = this.state.closeTab
                    if (closeTab[tab] == null) {
                        closeTab[tab] = false
                    }
                    items.push(
                        <div key={tab} style={style}>
                            <ErrorBoundary onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)}>
                                <PluginObject locale="en" height={(this.state.areaHeight + DEFINED_API.page.services.API.getHeightOffset(openTab.plugin))} width={(this.state.areaWidth + DEFINED_API.page.services.API.getWidthOffset(openTab.plugin))} uuid={openTab.uuid} onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)} />
                            </ErrorBoundary>
                        </div>)
                    //If its not a plugin, its most likely a built in page.
                } else {
                    if (openTab.builtIn != null) {
                        let style = { display: "none" }
                        //If this is the tab that's selected
                        if (tab == this.state.selectedTab) {
                            style = { height: (this.state.areaHeight + DEFINED_API.page.services.API.getHeightOffset(openTab.plugin)), width: (this.state.areaWidth + DEFINED_API.page.services.API.getWidthOffset(openTab.plugin)) }
                        }
                        //What tab is being closed
                        let closeTab = this.state.closeTab

                        if (closeTab[tab] == null) {
                            closeTab[tab] = false
                        }
                        if (openTab.builtIn.toLowerCase() == "settings") {
                            items.push(
                                <div key={tab} style={style}>
                                    <ErrorBoundary onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)}>
                                        <Settings locale="en" uuid={openTab.uuid} onClose={closeTab[tab]} close={this.forceCloseTab.bind(this, tab)} />
                                    </ErrorBoundary>
                                </div>)
                        }
                    }
                }

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
        return <Layout.Grid canvas>
            <Layout.Grid col>
                {/*Sidebar*/}
                <Sidebar localPlugins={this.props.localPlugins} />
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
                                    <Button className="pt-minimal" icon="cog" onClick={this.openBuiltIn.bind(this, "Settings")} />
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
    }
}

let PluginConsumer = (props) => {
    return <GlobalContext.Consumer>
        {context => <PluginRender {...props} globalEvent={context.globalEvent} />}
    </GlobalContext.Consumer>
}

export default class App extends Component {
    constructor() {
        super()
        //Create a global event listner, used by the GlobalContext Provider
        var objectEvent = new events.EventEmitter();
        this.state = {
            globalProvider: {
                globalEvent: objectEvent
            },
            settings: stash.get("settings"),
            usedPlugins: stash.get("pluginsAllowed"),
            mode: 0
        }
        console.log(stash.get("settings"))
    }
    renderPlugins() {
        console.log(this.state.mode)
        if (this.state.mode == 2) {
            console.log("loader")
            return <PluginConsumer localPlugins={this.state.localPlugins} />
        }
    }
    componentDidMount() {
        let mode = 0

        let usedPlugins = this.state.usedPlugins
        if (this.state.usedPlugins == null) {
            stash.set("pluginsAllowed", {})
            usedPlugins = {}
        }
        let localPlugins = {}
        for (let plugin in DEFINED_PLUGIN) {
            console.log(plugin)
            if (plugin != "__customRegisters") {
                if (usedPlugins[plugin] == null) {
                    localPlugins[plugin] = true
                } else {
                    localPlugins[plugin] = usedPlugins[plugin]
                }
            }
        }
        if (this.state.settings.developer.updates.toggleLoading.selected == false) {
            mode = -1
        }
        this.setState({ localPlugins, usedPlugins, mode })


        let this_ = this
        manager.onAppReady(() => {
            console.log("%cOBSERVO", "color: cyan; font-size: 50px")
            console.log("%cMade by OnoTools [@ImportProgram]", "font-weight: bold; font-size: 24px")
            this_.setState({ mode: 2 })
        })

    }
    onPluginSelection(name) {
        let localPlugins = this.state.localPlugins
        if (localPlugins[name] != null) {
            if (localPlugins[name]) localPlugins[name] = false
            else {
                localPlugins[name] = true
            }
        }
        this.setState({ localPlugins })
        stash.set("pluginsAllowed", localPlugins)
    }
    onPluginLoad() {
        for (let plugin in this.state.localPlugins) {
            if (this.state.localPlugins[plugin] == false) {
                manager.disableModule("plugins", plugin)
            }
        }
    
        setTimeout(() => {
            manager.start()
        }, 500)

    }
    renderChooser() {
        let renderPlugins = () => {
            let items = []
            for (let plugin in this.state.localPlugins) {
                items.push(<Layout.Grid key={plugin}>
                    <Checkbox checked={this.state.localPlugins[plugin]} onChange={this.onPluginSelection.bind(this, plugin)}>
                        <strong>{plugin.toUpperCase()}</strong>
                    </Checkbox>
                </Layout.Grid>)
            }
            return items
        }
        if (this.state.mode == 0) {
            return <Layout.Grid canvas style={{ margin: 30 }}>
                <Layout.Grid center>
                    <div>
                        <Layout.Grid style={{ border: "1px solid black" }}>
                            <h1>Plugin Selection</h1>
                            <Layout.Grid row>
                                {renderPlugins()}
                            </Layout.Grid>
                            <Button onClick={this.onPluginLoad.bind(this)}>Load</Button>
                        </Layout.Grid>
                    </div>
                </Layout.Grid>
            </Layout.Grid>
        }
    }
    renderLoader() {
        return <h1>loading</h1>
    }
    render() {
        return (
            <Window color="rgba(0, 153, 191, 0)" background="rgba(0, 153, 191, 1)">
                <TitleBar background="#00acd7" title={<span className="observo-text">OBSERVO</span>} controls />
                <GlobalContext.Provider value={this.state.globalProvider}>
                    {this.renderPlugins()}
                    {this.renderChooser()}
                </GlobalContext.Provider>
            </Window>

        );

    }
}

