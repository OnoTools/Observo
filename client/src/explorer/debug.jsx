import React, { Component } from 'react'
const notifier = require('node-notifier');
import { Button, Intent, Tooltip, Icon, Classes, Portal } from "@blueprintjs/core";
import { Layout } from "crust"
import Draggable from 'react-draggable';
import {GlobalContext} from "global-context"
import os from 'os'
require("babel-polyfill")


export default class Debug extends Component {
    componentDidMount() {
        
    }
    render() {
        let style = { background: "color", width: 0, height: 0 }
        if (this.props.isOpen) {
            return <Portal>
            <div style={style}>
                <Draggable
                    defaultPosition={{ x: 580, y: 40 }}
                    bounds={{ left: 10, top: 40, right: 580, bottom: 600 }}
                >
                    <div style={{ width: 300, height: 300 }}>
                        <Layout.Grid col>
                            <Layout.Grid col height="40px" style={{ borderBottom: "1px solid #C9D0D5" }}>
                                <div className="pt-dialog-header" style={{ margin: 0 }}><Icon icon="code" />
                                    <h4 className="pt-dialog-header-title">Debug</h4>
                                </div>
                            </Layout.Grid>

                            <Layout.Grid row>
                                <Layout.Grid col width="300px" height="200px" background="lightgray">
                                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 14 }} >
                                        OS: {os.platform()} <br/>
                                        Arch: {os.arch()} <br/>
                                        CPU: {os.cpus()[0].model}
                                    </p>
                      
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                    </div>
                </Draggable>
            </div>
        </Portal>
        } else {
           return null
        }
        
    }
}