import React, { Component } from 'react'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Dialog, Alignment, ButtonGroup, Menu, MenuItem, Classes, Collapse, Overlay, Position, InputGroup } from "@blueprintjs/core";
import { Layout } from "crust"
import {GlobalContext} from "global-context"
import classNames from 'classnames'
import hotkeys from 'hotkeys-js';
import io from 'socket.io-client';
import { AppToaster } from "../toaster";
import Settings from "../settings.jsx"
require("babel-polyfill")


export default class Home extends Component {
    constructor() {
        super()
        this.state = {
            isHelpOpen: false,
            isSettingsOpen: false,
            settings: {
                general: {
                    display: "General",
                    icon: "layers",
                    selected: true,
                    sections: {
                        select: {
                            display: "General",
                            list: {
                                selectOpts:{
                                    display: "Select Options",
                                    type: "DROPDOWN",
                                    options: [
                                        { icon: "grid", text: "Grid", selected: true },
                                        { icon: "edit", text: "Edit" },
                                        { icon: "download", text: "Download" },
                                        { icon: "lock", text: "Lock" }
                                    ]
                                }
                            }
                        }
                    }
                },
                updates: {
                    display: "Updates",
                    icon: "automatic-updates",
                    selected: false,
                    sections: {
                        main: {
                            display: "Updates",
                            list: {
                                selectOpts:{
                                    display: "Automatically Update:",
                                    type: "TOGGLE",
                                    options: {
                                        selected: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * OpenHelp - Opens Help Drawer
     */
    openHelp() {
        if (this.state.isHelpOpen == false) {
            this.setState({ isHelpOpen: true })
        } else {
            this.setState({ isHelpOpen: false })
        }
    }
    openSettings() {
        if (this.state.isSettingsOpen == false) {
            this.setState({ isSettingsOpen: true })
        } else {
            this.setState({ isSettingsOpen: false })
        }
    }
    render() {
        return <Layout.Grid row style={{ justifyContent: 'flex-start', height: '100%' }}>
            <Settings
                isOpen={this.state.isSettingsOpen}
                onCancel={this.openSettings.bind(this)}
                settings={this.state.settings}
            />
            <Overlay isOpen={this.state.isHelpOpen} style={{ top: 10 }} onClose={this.openHelp.bind(this)}>

                <Layout.Grid height="200px" width="100%" background="white" className={Classes.ELEVATION_4} >
                    Thanks for using observo!
                </Layout.Grid>

            </Overlay>
            <Layout.Grid col>
                <Layout.Grid style={{ alignSelf: 'stretch', flexGrow: 2 }}>
                    <Layout.Grid col>
                        <Layout.Grid height="350px">
                            <section style={{ position: 'relative', margin: 'auto', top: '30%', right: 0, bottom: 0, left: 0, borderRadius: 3, textAlign: 'center' }}>
                                <p style={{ fontSize: "72px" }} className="observo-text">
                                    Observo
                                    </p>
                                <p>A multi-user data manipulation system</p>
                            </section>
                        </Layout.Grid>
                        <Layout.Grid row height="180px">
                            <Layout.Grid>
                                <Layout.Grid row center>
                                    <Button style={{ width: 200, height: 100 }} onClick={() => { this.props.moveLeft() }}>
                                        <Layout.Box>
                                            <Icon icon="database" style={{ width: 30, height: 30 }} />

                                            <h3 style={{ paddingLeft: 10 }}>SERVERS</h3>
                                        </Layout.Box>
                                    </Button>
                                </Layout.Grid>
                            </Layout.Grid>
                            <Layout.Grid>
                                <Layout.Grid row center >
                                    <Button style={{ width: 200, height: 100 }} id="projects" onClick={() => { AppToaster.show({ icon: "info-sign", message: "Local projects coming soon!", intent: Intent.PRIMARY, }); }}>
                                        <Layout.Box>
                                            <Icon icon="folder-open" style={{ width: 30, height: 30 }} />
                                            <h3 style={{ paddingLeft: 10 }}>PROJECTS</h3>
                                        </Layout.Box>
                                    </Button>
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid row height="65px" style={{ marginLeft: 10 }}>
                    <Layout.Grid>
                        <Button id="settings" style={{ height: 50, width: 50 }} onClick={this.openSettings.bind(this)}>
                            <Layout.Box>
                                <Icon icon="cog" />
                            </Layout.Box>
                        </Button>
                    </Layout.Grid>
                    <Layout.Grid />
                    <Layout.Grid width="57px">
                        <Button id="about" style={{ height: 50, width: 50 }} onClick={this.openHelp.bind(this)}>
                            <Layout.Box>
                                <Icon icon="help" />
                            </Layout.Box>
                        </Button>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        </Layout.Grid>

    }
}