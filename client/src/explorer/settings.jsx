import React, { Component } from 'react'
import { Button, Intent, Switch, Icon, Popover, Menu, MenuItem, Classes, Overlay, Position, InputGroup } from "@blueprintjs/core";
import { Layout } from "@importcore/crust"




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
        let localSettings = this.props.settings
        let save = this.props.saved
        if (save == null) {
            save = {}
        }
        for (let category in localSettings) {
            let i = this.props.settings[category]
            if (save[category] == null) {
                save[category] = {}
            }
            //console.log(save[category])
            for (let section in localSettings[category].sections) {
                if (save[category][section] == null) {
                    save[category][section] = {}
                }
                //console.log(save[category][section])
                for (let object in localSettings[category].sections[section].list) {
                    if (save[category][section][object] == null) {
                        save[category][section][object] = {}
                    }
                    //console.log(localSettings[category].sections[section].list[object])
                    localSettings[category].sections[section].list[object].options = save[category][section][object]
                }
            }
            if (i.selected) {
                this.setState({ defaultView: category, selectedView: category, localSettings: localSettings, localSaved: this.props.saved, localSettingsO: this.props.settings })
            }
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isOpen != this.props.isOpen) {
            //console.log(this.state.defaultView)
            this.setState({ selectedView: this.state.defaultView })
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
                styleText.color = "blue"
                styleIcon.color = "blue"
            }
            items.push(<Layout.Grid key={item} col height="50px" style={{ cursor: "pointer" }} className="settings-section" onClick={this.switchView.bind(this, item)}>
                <Layout.Grid>
                    <Layout.Grid col center style={{ paddingTop: 15, paddingBottom: 15 }}>
                        <Layout.Box>
                            <Icon icon={i.icon} style={styleIcon} iconSize={30} />
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
        let save = this.state.localSaved
        for (let section in copy[data.category].sections) {
            if (section == data.section) {
                for (let object in copy[data.category].sections[section].list) {
                    if (object == data.object) {
                        for (let item in copy[data.category].sections[section].list[object].options) {
                            if (copy[data.category].sections[section].list[object].options !== "undefined") {
                                if (copy[data.category].sections[section].list[object].options[item].text == name) {
                                    copy[data.category].sections[section].list[object].options[item].selected = true
                                    save[data.category][section][section][item].selected = true
                                } else {
                                    copy[data.category].sections[section].list[object].options[item].selected = false
                                    save[data.category][section][section][item].selected = false
                                }
                            }
                        }
                    }
                }
            }
        }
        this.setState({ localSettings: copy, localSaved: save })
        if (this.props.onChange) {
            this.props.onChange(save)
        }
    }
    /**
     * updateSwitch - When switch is activated, update the state of the switch, globally
     * @param {Object} data The data tree passed down {category, section, object}
     * @param {Boolean} boolean State of the switch
     */
    updateSwitch(data, boolean) {
        let copy = this.state.localSettings
        let save = this.state.localSaved
        for (let section in copy[data.category].sections) {
            if (section == data.section) {
                for (let object in copy[data.category].sections[section].list) {
                    if (object == data.object) {
                        copy[data.category].sections[section].list[object].options.selected = !boolean
                        save[data.category][section][object].selected = !boolean
                    }
                }
            }
        }
        this.setState({ localSettings: copy, localSaved: save })
        if (this.props.onChange) {
            this.props.onChange(save)
        }
    }
    updateInput(data, event) {
        let copy = this.state.localSettings
        let save = this.state.localSaved
        for (let section in copy[data.category].sections) {
            if (section == data.section) {
                for (let object in copy[data.category].sections[section].list) {
                    if (object == data.object) {
                        copy[data.category].sections[section].list[object].options.text = event.currentTarget.value
                        save[data.category][section][object].text = event.currentTarget.value
                    }
                }
            }
        }
        this.setState({ localSettings: copy, localSaved: save })
        if (this.props.onChange) {
            this.props.onChange(save)
        }
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
            s
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
        let renderInput = (key, options, text, data) => {
            return <Layout.Grid key={"observoSettingInput" + key} height="40px" style={{ marginTop: 5 }}>
                <Layout.Box>
                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 20 }} >{text}: </p> <InputGroup value={options.text} style={{ marginLeft: 15, marginTop: 5, fontSize: 20 }} onChange={this.updateInput.bind(this, data)} />
                </Layout.Box>
            </Layout.Grid>
        }
        let renderText = (key, options, text, data) => {
            return <Layout.Grid key={"observoSettingText" + key} style={{ marginTop: 5 }}>
                <Layout.Box>
                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 20 }} >{
                        text.split("\n").map(function (item, idx) {
                            return (
                                <span key={idx}>
                                    {item}
                                    <br />
                                </span>
                            )
                        })
                    }</p>
                </Layout.Box>
            </Layout.Grid>
        }
        let renderButton = (event, key, value, text, data) => {
            return <Layout.Grid key={"observoSettingText" + key} style={{ marginTop: 5 }}>
                <Layout.Box>
                    <p style={{ paddingLeft: 10, marginTop: 5, fontSize: 20 }} >{text}:     </p>
                    <Button style={{ marginLeft: 20 }} intent={Intent.SUCCESS} onClick={event.bind(this)}>{value}</Button>
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
                            if (object.type == "INPUT") { //IDENTIFY TYPE
                                items.push(renderInput(o, object.options, object.display, data))
                            }
                            if (object.type == "TEXT") { //IDENTIFY TYPE
                                items.push(renderText(o, object.options, object.display, data))
                            }
                            if (object.type == "BUTTON") { //IDENTIFY TYPE
                                //console.log(this.state.localSettings[item].sections[sec].list[o])
                                let event = this.state.localSettings[item].sections[sec].list[o].event
                                let text = this.state.localSettings[item].sections[sec].list[o].text
                                items.push(renderButton(event, o, text, object.display, data))
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
     * CancelHandeler - When cancel button is clicked
     */
    closeHandler() {
        if (this.props.onSave) {
            this.props.onSave()
        }
    }
    /**
     * Render 
     */
    render() {
        return <Overlay
            canEscapeKeyClose={true}
            icon="cog"
            isOpen={this.props.isOpen}
            onClose={this.props.onClose}
            title="Settings"
            backdropClassName="settings"
            transitionDuration={0}
        >
            <Layout.Grid height="100%" width="100%" background="lightgray" style={{top: 30}} className={Classes.ELEVATION_4} >
                <Layout.Grid row>
                    <Layout.Grid row height="40px" style={{ borderBottom: "1px solid #C9D0D5" }}>
                        <div className="bp3-dialog-header" style={{ margin: 0, height: 30, width: "100%" }} ><Icon icon="cog" />
                            <h4 className="bp3-dialog-header-title">Settings</h4>
                            <div className="bp3-dialog-footer">
                                <div className="bp3-dialog-footer-actions" style={{paddingRight: 10 }}>
                                    <Button
                                        intent={Intent.SUCCESS}
                                        text="Save"
                                        style={{ paddingRight: 10 }}
                                        onClick={this.closeHandler.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Layout.Grid>

                    <Layout.Grid col>
                        <Layout.Grid row width="200px">
                            {this.renderCategoryList()}
                        </Layout.Grid>
                        <Layout.Grid row width="10px" height="3000px" background="white" style={{ borderLeft: "3px solid white" }}> </Layout.Grid>
                        <Layout.Grid row height="100%" width="100%" style={{ overflowY: "auto", overflow: "overlay" }}>
                            {this.renderViewArea()}
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        </Overlay>
    }
}