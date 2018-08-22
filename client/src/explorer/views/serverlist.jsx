import React, { Component } from 'react'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Dialog, Alignment, ButtonGroup, ContextMenu, Menu, MenuItem, Classes, Collapse, Overlay, Position, InputGroup } from "@blueprintjs/core";
import { Layout } from "crust"
import {GlobalContext} from "global-context"
require("babel-polyfill")

export default class ServerList extends Component {
    constructor() {
        super()
        this.state = {
            addSeverDialog: false
        }
    }
    /**
     * AddServer - Opens and Closes the ADD SERVER dialog
     */
    addServer() {
        console.log("clicked")
        if (this.state.addSeverDialog == false) {
            this.setState({ addSeverDialog: true })
        } else {
            this.setState({ addSeverDialog: false })
        }
        if (this.props.onDisconnect) {
            this.props.onDisconnect()
        }
    }
    /**
     * ConnectToServer - When a server is selected this will trigger
     */
    connectToServer(ip, name) {
        if (this.props.onConnect) {
            this.props.onConnect(ip, name)
        }

    }
    showContext(event) {
        const menu = <Menu>
            <MenuItem icon="edit" text="Edit" />
            <MenuItem icon="trash" text="Delete" />
        </Menu>
        ContextMenu.show(menu, { left: event.clientX, top: event.clientY }, () => {
            // menu was closed; callback optional
        });
    }
    /**
     * RenderServers - Renders all servers listed on the sidebar
     */
    renderServers() {
        if (stash.has('serverList')) {
            let servers = stash.get('serverList')
            let items = []
            for (let server in servers) {
                let s = servers[server]
                items.push(
                    <Layout.Grid key={server} height="50px" width="100%" style={{ borderBottom: "1px solid black", cursor: "pointer" }} onClick={this.connectToServer.bind(this, s.ip, s.name)} onContextMenu={(this.showContext.bind(this))} background="gray">
                        <p>{s.name}</p>
                        <p>{s.ip}</p>
                    </Layout.Grid>

                )
            }
            return items
        }
        return null
    }
    /**
     * Renders ADD SERVER dialog
     */
    renderAddDialog() {
        return <Dialog
            icon="database"
            isOpen={this.state.addSeverDialog}
            onClose={this.addServer.bind(this)}
            title="Add Server"
        >
            <div className="pt-dialog-body">
                <Layout.Grid canvas style={{ paddingTop: "10px" }}>
                    <Layout.Grid row>
                        <Layout.Grid row>
                            <Layout.Grid col width="75px">
                                <Layout.Grid>
                                    <p>Name</p>
                                </Layout.Grid>
                                <Layout.Grid>
                                    <p>Address</p>
                                </Layout.Grid>
                            </Layout.Grid>
                            <Layout.Grid col>
                                <Layout.Grid>
                                    <InputGroup leftIcon="wrench" />
                                </Layout.Grid>
                                <Layout.Grid>
                                    <InputGroup leftIcon="ip-address" />
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>

                        <Layout.Grid width="20px" />
                        <Layout.Grid height="100px" style={{ border: "1px solid black" }}>
                            List of LAN server will populate here
                    </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
            </div>
            <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
                    <Button
                        intent={Intent.SUCCESS}
                        text="Add"
                    />
                </div>
            </div>
        </Dialog>
    }
    render() {
        return <Layout.Grid row id="container" style={{ justifyContent: 'flex-start', height: '100%' }}>
            <Layout.Grid col width="300px" height="100%" style={{ overflowY: "auto", overflow: "overlay" }} background="#99ceec">
                {this.renderServers()}
            </Layout.Grid>
            <Layout.Grid col>
                <Layout.Grid style={{ alignSelf: 'stretch', flexGrow: 2 }}>
                    <Layout.Grid col>
                        <Layout.Grid style={{ flex: '0 0 auto', height: 350 }}>
                            <section style={{ position: 'relative', margin: 'auto', top: '30%', right: 0, bottom: 0, left: 0, borderRadius: 3, textAlign: 'center' }}>
                                <p style={{ fontSize: 72 }} className="rb-font observo-title">
                                    Servers
                                </p>
                            </section>
                        </Layout.Grid>
                        <Layout.Grid height="230px">
                            <Layout.Grid row center id="yep">
                                <Button style={{ width: 200, height: 100 }} id="addServer" onClick={this.addServer.bind(this)}>
                                    <Layout.Box>
                                        <Icon icon="folder-open" style={{ width: 30, height: 30 }} />
                                        <h3 style={{ paddingLeft: 10 }}>ADD SERVER</h3>
                                    </Layout.Box>
                                </Button>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid row style={{ flex: '0 0 auto', height: 100, marginLeft: 10 }}>
                    <Layout.Grid />
                    <Layout.Grid style={{ flex: '0 0 auto', width: 60 }}>
                        <Tooltip content="Go back" position={Position.LEFT}>
                            <Button id="back" onClick={() => { this.props.moveRight() }}>
                                <Layout.Box>
                                    <Icon icon="chevron-right" style={{ width: 30, height: 30 }} />
                                </Layout.Box>
                            </Button>
                        </Tooltip>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
            {this.renderAddDialog()}
        </Layout.Grid>

    }
}


