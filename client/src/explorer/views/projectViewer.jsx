import React, { Component } from 'react'
import { Button, Card, Intent, Icon, Dialog, Alignment, Tag, Tooltip, ButtonGroup, ContextMenu, Menu, MenuItem, Classes, Collapse, Overlay, Position, InputGroup, Alert, Elevation } from "@blueprintjs/core";
import { Layout } from "crust"
import classNames from 'classnames'
import hotkeys from 'hotkeys-js';
import io from 'socket.io-client';
import { GlobalContext } from "global-context"
import moment from 'moment';
import {remote} from 'electron'
const { BrowserWindow } = remote
const managerLocal = require("import-window")
const managerRemote = remote.require("import-window")
window.moment = moment;

require("babel-polyfill")
class ProjectViewer extends Component {
    constructor() {
        super()
        this.state = {
            alertDisconnect: false,       
            user: {
                roles: [],
                name: null
            }
        }
    }
    /**
     * GoBack - Go Back? idk
     */
    openWindow() {

    }
    componentDidMount() {
        let self = this
        this.props.globalEvents.on("SOCKET:connected", (socket) =>{
            socket.client.on("core_userData", (data) => {
                self.setState({ user: data })
            })
            socket.client.on("core_projectList", (data) => {
                self.setState({ projects: data})
            })
            socket.client.on("auth_vaildSignin", (data) => {
                self.setState({auth: data})
                
            })
        })
    }
    goBack() {
        if (this.state.alertDisconnect == false) {
            this.setState({ alertDisconnect: true })
        } else {
            this.setState({ alertDisconnect: false })
        }
    }
    showContext(event) {
        const menu = <Menu>
            <MenuItem icon="edit" text="Rename" />
            <MenuItem icon="lock" text="Archive" />
        </Menu>
        ContextMenu.show(menu, { left: event.clientX, top: event.clientY }, () => {
            // menu was closed; callback optional
        });
    }
    openProject(project) {
        console.log("new window")
        let args = managerLocal.parseArgs() 
        console.log(args)
        let mainWin = managerRemote.createWindow({
            show: false,
            width: 1000,
            height: 800,
            frame: false,
            color: "#000",
            webPreferences: {
              zoomFactor: 0.9,
            }
          })
          //Intead of __dirname we used '.getDir()' 
          mainWin.setURL(managerRemote.getDir(), "./src/projects/index.html", {
            ip: this.props.serverProperties.ip,
            authKey: this.state.auth.authKey,
            uuid: this.state.auth.uuid,
            project: project,
          })
          mainWin.win.setMinimumSize(800, 700);
            mainWin.win.webContents.on('did-finish-load', () => {
            mainWin.win.show()
            //win.close();
          })
    }
    /**
     * RenderServers - Renders all servers listed on the sidebar
     */
    renderServers() {
        if (this.state.projects != null) {
            let items = []
            for (let p in this.state.projects) {
                let project = this.state.projects[p]
                console.log(project)
                items.push(
                    <Layout.Grid key={p} height="75px" width="100%" style={{ borderBottom: "1px solid black", cursor: "pointer" }} onContextMenu={this.showContext.bind(true)}  onClick={this.openProject.bind(this, project.name)}className="box">
                        <p>{project.name}</p>
                        <p>Last Edited: {moment(new Date(project.lastEdited.replace(/\s/g, "T")).toUTCString()).fromNow()}</p>
                    </Layout.Grid>
                )
            }
            return items
        }
        return null
    }
    /**
     * Renders ALERT about disconnecting from the server
     */
    renderDisconnect() {
        return <Alert
            cancelButtonText="Cancel"
            confirmButtonText="Disconnect"
            icon="offline"
            intent={Intent.DANGER}
            isOpen={this.state.alertDisconnect}
            onCancel={this.goBack.bind(this)}
            onConfirm={() => { this.setState({ alertDisconnect: false }); this.props.globalEvents.emit("SOCKET:close") }}
        >
            <p>
                Are you sure you want to disconnect? </p>
        </Alert>
    }
    render() {
        const renderRoles = (roles) => {
            let items = []
            for (let r in roles) {
                let role = roles[r]
                items.push(<Layout.Grid key={r}><Tag style={{ background: role.color, marginBottom: 10, margin: 3 }}>{role.name}</Tag></Layout.Grid>)
            }
            return items
        }
        return <Layout.Grid row id="container" style={{ justifyContent: 'flex-start', height: '100%' }}>
            <Layout.Grid col>
                <Layout.Grid style={{ alignSelf: 'stretch', flexGrow: 2 }}>
                    <Layout.Grid col>
                        <Layout.Grid row style={{ flex: '0 0 auto', height: 350 }}>
                            <Layout.Grid>
                                <Card interactive={false} elevation={Elevation.TWO} style={{ margin: 10 }}>
                                    <h2>{this.props.serverProperties.name}</h2>
                                    <p>{this.props.serverProperties.ip}</p>
                                </Card>
                            </Layout.Grid>
                            <Layout.Grid>
                                <Card interactive={false} elevation={Elevation.TWO} style={{ margin: 10, height: 108 }}>
                                    <Layout.Grid row>
                                        <Layout.Grid>
                                            <h2>{this.state.user.name}</h2>
                                        </Layout.Grid>
                                        <Layout.Grid col>
                                            {renderRoles(this.state.user.roles)}
                                        </Layout.Grid>
                                    </Layout.Grid>
                                </Card>
                            </Layout.Grid>
                        </Layout.Grid>
                        <Layout.Grid height="230px">

                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
                <Layout.Grid row style={{ flex: '0 0 auto', height: 100, marginLeft: 10 }}>
                    <Layout.Grid style={{ flex: '0 0 auto', width: 60 }}>
                        <Tooltip content="Go back" position={Position.LEFT}>
                            <Button id="back" onClick={this.goBack.bind(this)}>
                                <Layout.Box>
                                    <Icon icon="chevron-left" style={{ width: 30, height: 30 }} />
                                </Layout.Box>
                            </Button>
                        </Tooltip>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
            <Layout.Grid col width="300px" height="100%" style={{ overflowY: "auto", overflow: "overlay" }} className="observo--sidebar">
                {this.renderServers()}
            </Layout.Grid>
            {this.renderDisconnect()}
        </Layout.Grid>
    }
}


export default props => (
    <GlobalContext.Consumer>
      {context => <ProjectViewer {...props}  globalEvents={context.globalEvent} />}
    </GlobalContext.Consumer>
  );