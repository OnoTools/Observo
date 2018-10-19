import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Alignment, Classes, ContextMenu, MenuItem, Menu } from "@blueprintjs/core";
import { Layout } from "@importcore/crust"
import { GlobalContext } from "global-context"
import { TouchBarScrubber } from 'electron';
const INITIAL_STATE = [
    {
        id: 0,
        plugin: "users",
        hasCaret: false,
        icon: "folder-close",
        label: "Folder 0",
    },
    {
        id: 1,
        icon: "folder-close",
        isExpanded: true,
        label: <Tooltip content="I'm a folder <3">Folder 1</Tooltip>,
        childNodes: [
            {
                id: 2,
                icon: "document",
                label: "Item 0",
                secondaryLabel: (
                    <Tooltip content="An eye!">
                        <Icon icon="eye-open" />
                    </Tooltip>
                ),
            },
        ],
    },
];
class Sidebar extends Component {
    constructor() {
        super()
        this.state = {
            nodes: [ {
                id: 0,
                plugin: "users",
                hasCaret: false,
                icon: "loading",
                label: "Loading",
            }]
        }
    }
    componentDidMount() {
        let self = this
        this.props.globalEvents.on("SOCKET:connected", ({global, client, clientPlugins}) =>{
            client.on("core_getProject", ({projectData, pages, plugins}) => {
                let projectPlugins = JSON.parse(projectData.plugins)
                let nodes = []
                //Loops are used to id nodes in the tree view
                let loop = 0
                for (let plugin in projectPlugins) {
                    //Split the plugins from the version, given from the server
                    let plug = projectPlugins[plugin].split("@")
                    let name = plug[0]
                    let ver = plug[1]
                    let pass = false
                    //Loop through all plugins in the client list
                    for (let pluginName in clientPlugins) {
                        //Get local plugins and server plugins
                        let localPlug = clientPlugins[pluginName]
                        let serverPlug = plugins[pluginName]
                        //Ingore the defined.js custom registers handler
                        if (pluginName != "__customRegisters") {
                            if (localPlug.package.name == name && localPlug.package.version == ver) {
                                pass = true
                                let lNode = {} 
                                lNode.id = loop
                                lNode.label = serverPlug.package.settings.title
                                lNode.hasCaret = false
                                lNode.plugin = pluginName
                                if (serverPlug.package.settings.icon != null) {
                                    lNode.icon = serverPlug.package.settings.icon
                                }
                                //CHeck to see if the server plugin is dynamic, if so add caret and make it expanded
                                if (serverPlug.package.settings.dynamic) {
                                    lNode.isExpanded = true
                                    //Now loop through all pages that may be used for this plugin
                                    for (let page in pages) {
                                        if (pages[page].plugin == pluginName) {
                                            if (lNode.childNodes == null) {
                                                lNode.childNodes = []
                                            }
                                            let oNode = {}
                                            oNode.id = loop
                                            oNode.prefix = serverPlug.package.settings.title
                                          
                                            oNode.label = pages[page].name
                                            oNode.uuid = pages[page].uuid
                                            oNode.plugin = pluginName
                                            lNode.childNodes.push(oNode)
                                            loop++
                                        }
                                    }
                                    lNode.hasCaret = true 
                                } else {
                                    //Find only occurence of the page that is the plugin and grab its uuid cause its not a dynamic module
                                    for (let page in pages) {   
                                        if (pages[page].plugin == pluginName) {
                                            lNode.uuid = pages[page].uuid
                                            break
                                        }
                                    } 
                                }
                                //Adds nodes to list
                                nodes.push(lNode)
                            } 
                        }
                    }
                    if (pass) {

                    } else {
                        alert("Yikes not all plugins can be found for this project? You can use what you have for now...")
                    }
                    loop++
                }
         
                self.setState({ nodes: nodes })
            })
        })
    }
    render() {
        return <Layout.Grid width="200px" height="100%" background="gray" style={{fontSize: 16, fontWeight: 'bold'}}>
            <Tree
                contents={this.state.nodes}
                onNodeClick={this.handleNodeClick.bind(this)}
                onNodeCollapse={this.handleNodeCollapse.bind(this)}
                onNodeExpand={this.handleNodeExpand.bind(this)}
                onNodeContextMenu={this.handleNodeContextMenu.bind(this)}
                className={Classes.ELEVATION_0}
            />
        </Layout.Grid>

    }
    handleNodeClick(nodeData, _nodePath, e) {
        this.props.globalEvents.emit("PLUGIN:open", nodeData)
        this.setState(this.state);
    }

    handleNodeCollapse(nodeData) {
        console.log(nodeData)
        nodeData.isExpanded = false;
        this.setState(this.state);
    }
    handleNodeContextMenu(nodeData, nodePath, event) {
        console.log(nodeData)
        const menu = <Menu>
            <MenuItem icon="file" text="New" />
        </Menu>
        if (nodeData.hasCaret) {
            ContextMenu.show(menu, { left: event.clientX, top: event.clientY }, () => {
                // menu was closed; callback optional
            });
        }
    }
    handleNodeExpand(nodeData) {
        nodeData.isExpanded = true;
        this.setState(this.state);
    }

    forEachNode(nodes, callback) {
        if (nodes == null) {
            return;
        }

        for (const node of nodes) {
            callback(node);
            this.forEachNode(node.childNodes, callback);
        }
    }
}

export default props => (
    <GlobalContext.Consumer>
        {context => <Sidebar {...props} globalEvents={context.globalEvent} />}
    </GlobalContext.Consumer>
);