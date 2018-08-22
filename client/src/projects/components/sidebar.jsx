import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Alignment, Classes } from "@blueprintjs/core";
import { Layout } from "crust"
import { GlobalContext } from "global-context"
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
        this.props.globalEvents.on("SOCKET:connected", (socket) =>{
            console.log("Connected via the sidebar")
            socket.client.on("core_getProject", (data) => {
                let plugins = JSON.parse(data.plugins)
                let nodes = []
                let loop = 0
                for (let plugin in plugins) {
                    let p = plugins[plugin]
                    let lNode = {} 
                    lNode.id = loop
                    lNode.label = plugin.toUpperCase()
                    lNode.hasCaret = false
                    if (p.dynamic) {
                        lNode.hasCaret = true 
                    }
                    nodes.push(lNode)
                    loop++
                }
                self.setState({ nodes: nodes })
            })
        })
    }
    render() {
        return <Layout.Grid width="200px" height="100%" background="gray">
            <Tree
                contents={this.state.nodes}
                onNodeClick={this.handleNodeClick.bind(this)}
                onNodeCollapse={this.handleNodeCollapse.bind(this)}
                onNodeExpand={this.handleNodeExpand.bind(this)}
                className={Classes.ELEVATION_0}
            />
        </Layout.Grid>

    }
    handleNodeClick(nodeData, _nodePath, e) {
        console.log(nodeData)
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            this.forEachNode(this.state.nodes, n => (n.isSelected = false));
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected;
        this.setState(this.state);
    }

    handleNodeCollapse(nodeData) {
        console.log(nodeData)
        nodeData.isExpanded = false;
        this.setState(this.state);
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