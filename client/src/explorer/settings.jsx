import React, { Component } from 'react'
import { Button, Intent, Spinner, Switch, Tooltip, Icon, ProgressBar, Dialog, MenuDivider, Popover, Alignment, Menu, MenuItem, Classes, Collapse, Overlay, Position, InputGroup } from "@blueprintjs/core";
import { Layout } from "crust"
import { AppToaster } from "./toaster";
import {GlobalContext} from "global-context"
require("babel-polyfill")


export default class Settings extends Component {
    constructor() {
        super()
        this.state = {
            selectedView: null
        }
    }
    /**
     * componentDidMount
     * - Render the selected view on mount
     */
    componentDidMount() {
        for (let item in this.props.settings) {
            let i = this.props.settings[item]
            if (i.selected) {
                this.setState({ selectedView: item, localSettings: this.props.settings, localSettingsO: this.props.settings })
                break
            }
        }
    }
    switchView(name) {
        this.setState({ selectedView: name })
    }
    /**
     * renderCategoryList - Renders all categories in the sidebar
     */
    renderCategoryList() {
        let items = []
        for (let item in this.state.localSettings) {
            let i = this.state.localSettings[item]
            let styleText = { paddingLeft: 10, marginTop: 5, fontSize: 30 }
            let styleIcon = { width: 30, height: 30 }
            if (item == this.state.selectedView) {
                styleText.color = "#00acd7"
                styleIcon.color = "#00acd7"
            }
            items.push(<Layout.Grid key={item} row height="50px" style={{ cursor: "pointer" }} className="obsero--settings-section" onClick={this.switchView.bind(this, item)}>
                <Layout.Grid>
                    <Layout.Grid row center style={{ paddingTop: 15, paddingBottom: 15 }}>
                        <Layout.Box>
                            <Icon icon={i.icon} style={styleIcon} />
                            <p style={styleText} >{i.display}</p>
                        </Layout.Box>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>)
        }
        return items
    }
    /**
     * UpdateDropDown - Updates the drop down by checking name, and making its selected, and everything else not selected
     * @param {Object} data The data tree passed down {category, section, object}
     * @param {String} name Name of the MenuItem in the Menu 
     */
    updateDropdown(data, name) {
        let copy = this.state.localSettings
        for (let object in copy[data.category].sections) {
            if (object == data.section) {
                for (let s in copy[data.category].sections[object].list) {
                    if (s == data.object) {
                        for (let t in copy[data.category].sections[object].list[s].options) {
                            if (copy[data.category].sections[object].list[s].options !== "undefined") {
                                if (copy[data.category].sections[object].list[s].options[t].text == name) {
                                    copy[data.category].sections[object].list[s].options[t].selected = true
                                } else {
                                    copy[data.category].sections[object].list[s].options[t].selected = false
                                }
                            }

                        }
                    }
                }
            }
        }
        this.setState({ localSettings: copy })
    }
    /**
     * updateSwitch - When switch is activated, update the state of the switch, globally
     * @param {Object} data The data tree passed down {category, section, object}
     * @param {Boolean} boolean State of the switch
     */
    updateSwitch(data, boolean) {
        let copy = this.state.localSettings
        for (let section in copy[data.category].sections) {
            if (section == data.section) {
                for (let object in copy[data.category].sections[section].list) {
                    if (object == data.object) { 
                        copy[data.category].sections[section].list[object].options.selected = !boolean
                    }
                }
            }
        }
        this.setState({ localSettings: copy })
    }
    /**
     * RenderViewArea - Renders the views; Only renders the 'selected' view
     */
    renderViewArea() {
        /**
         * 
         * @param {String} key Identifier of the object
         * @param {Object} boolean State of the switch (boolean.selected)
         * @param {Stirng} text Text to display
         * @param {Object} data The data tree passed down {category, section, object}
         */
        let renderSwitch = (key, boolean, text, data) => {
            return <Layout.Grid key={"observoSettingSwitch" + key} height="30px" style={{ marginTop: 5 }}>
                <Layout.Box>
                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 20 }} >{text}: </p> <Switch checked={boolean.selected} style={{ marginLeft: 15, marginTop: 5, fontSize: 20 }} large onChange={this.updateSwitch.bind(this, data, boolean.selected)} />
                </Layout.Box>
            </Layout.Grid>
        }
        /**
         * RenderTitle - Renders title for a section
         * @param {String} key Identifier of the object 
         * @param {String} title The title of the section
         */
        let renderTitle = (key, title) => {
            return <Layout.Grid key={key} height="50px" style={{ borderBottom: "1px solid black" }}> <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 30 }} >{title}</p></Layout.Grid>
        }
        /**
         * RenderDropdown - Renders a dropdown based on the passed parameters based on the settings JSON
         * @param {String} key Identifier of the object
         * @param {Array} options Array of options to select from
         * @param {String} text Display text for the object
         * @param {Object} data The data tree passed down {category, section, object}
         */
        let renderDropdown = (key, options, text, data) => {
            /**
             * Renders the MenuItems for the Menu
             * @param {Items} z Options passed down by the function
             */
            let getMenu = (z) => {
                let opts = []
                for (let o in z) {

                    let a = z[o]
                    let _icon = null, _text = null, _disabled = false
                    if (a.icon != null) {
                        _icon = a.icon
                    }
                    if (a.text != null) {
                        _text = a.text
                    }
                    if (a.selected != null) {
                       if (a.selected) {
                            _disabled = true
                       }
                    }
                    opts.push(<MenuItem disabled={_disabled} key={"observoSettingDropdown" + o} onClick={this.updateDropdown.bind(this, data, _text)} icon={_icon} text={_text} />)
                }
                return <Menu>{opts}</Menu>
            }
            /**
             * GetSelected - Render the VALUE of the button (which is selected)
             * @param {Object} z Options passed down by the function
             */
            let getSelected = (z) => {
                for (let o in z) {
                    let a = z[o]
                    if (a.selected) {
                        let useIcon = null
                        if (a.icon != null) {
                            useIcon = <Icon icon={a.icon} style={{ width: 15, height: 15, marginRight: 5 }} />
                        }
                        return <span>{useIcon}{a.text}</span>
                    }
                }
            }

            //Render it
            return <Layout.Grid key={key} height="30px" style={{ marginTop: 5 }}>
                <Layout.Box>
                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 20 }} >{text}: </p>
                    <Popover content={getMenu(options)} position={Position.RIGHT}>
                        <Button style={{ marginLeft: 15 }} text={getSelected(options)} />
                    </Popover>
                </Layout.Box>
            </Layout.Grid>
        }
        //Local variables state
        let items = []
        for (let item in this.state.localSettings) { //CATEGORY
            let i = this.state.localSettings[item]
            if (item == this.state.selectedView) {
                for (let sec in i.sections) { //SECTIONS
                    let section = i.sections[sec]
                    items.push(renderTitle(sec, section.display)) //SECTION TITLE
                    for (let o in section.list) { //LIST OF OBJECTS (for that section)
                        let object = section.list[o]
                        if (object.type != null && object.options != null) { //CHECK IF NOT NULL
                            let data = { category: item, section: sec, object: o } //SUPPLY DATA TREE (for trace back)
                            if (object.type == "DROPDOWN") { //IDENTIFY TYPE
                                items.push(renderDropdown(o, object.options, object.display, data))
                            }
                            if (object.type == "TOGGLE") { //IDENTIFY TYPE
                                items.push(renderSwitch(o, object.options, object.display, data))
                            }
                        }
                    }
                }
            }
        }
        //RENDER THE VIEW
        return items
    }
    /**
     * SaveHandler - When save button is clicked
     */
    saveHandler() {
        if (this.props.onSave) {
            this.props.onSave()
        }
    }
    /**
     * CancelHandeler - When cancel button is clicked
     */
    cancelHandler() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }
    /**
     * Render 
     */
    render() {
        return <Overlay
            icon="cog"
            isOpen={this.props.isOpen}
            onClose={this.props.onClose}
            title="Settings"
            style={{ width: 500, height: 350 }}
            transitionDuration={0}
        >
            <Layout.Grid height="100%" width="100%" background="lightgray" className={Classes.ELEVATION_4} >
                <Layout.Grid col>
                    <Layout.Grid col height="40px" style={{ borderBottom: "1px solid #C9D0D5" }}>
                        <div className="pt-dialog-header" style={{ margin: 0 }}><Icon icon="cog" />
                            <h4 className="pt-dialog-header-title">Settings</h4>
                            <div className="pt-dialog-footer-actions" style={{ paddingRight: 10 }}>
                                <Button
                                    intent={Intent.SUCCESS}
                                    text="Save"
                                    style={{ paddingRight: 10 }}
                                    onClick={this.saveHandler.bind(this)}
                                />
                                <Button
                                    intent={Intent.DANGER}
                                    text="Cancel"
                                    onClick={this.cancelHandler.bind(this)}
                                />
                            </div>
                        </div>
                    </Layout.Grid>

                    <Layout.Grid row>
                        <Layout.Grid col width="200px">
                            {this.renderCategoryList()}
                        </Layout.Grid>
                        <Layout.Grid width="10px" height="100%" background="white" style={{ borderLeft: "3px solid white" }}> </Layout.Grid>
                        <Layout.Grid col height="100%" width="100%" style={{ overflowY: "auto", overflow: "overlay" }}>
                            {this.renderViewArea()}
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        </Overlay>
    }
}