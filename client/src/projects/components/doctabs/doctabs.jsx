import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { Button, Intent, Spinner, Tree, ITreeNode, Tooltip, Icon, ProgressBar, Navbar, Alignment } from "@blueprintjs/core";
import { Layout } from "@importcore/crust"
import { AppToaster } from "../../toaster";
import './doctabs.less'
import Draggable from 'react-draggable';



export default class DocTab extends Component {
    constructor() {
        super()
        this.state = {
            index: 0,
            tabs: []
        }
        this.myRef = React.createRef();
        this.width = 0
    }

    /**
     * The start of a tab being dragged
     * @param {Number} id 
     * @param {MouseEvent} data 
     * @param {DragEvent} event 
     */
    handleStart(id, data, event) {
        let offsetX = id * this.width
        let x = event.x + offsetX
        this.setState({ selectedTab: id, selectedTabX: x, dragging: true })
        if (this.props.onSelect) {
            this.props.onSelect(this.state.tabs[id].title)
            if (this.props.onChange) {
                this.props.onChange(this.state.tabs, id)
            }
        }
    }
    /**
     * The drag event during its movement process
     * @param {Number} id 
     * @param {MouseEvent} data 
     * @param {DragEvent} event 
     */
    handleDrag(id, data, event) {
        let offsetX = id * this.width
        let x = event.x + offsetX
        this.setState({ selectedTabX: x })
    }

    handleStop(id, data, event) {
        //shift code here and call onChange event
        let array_move = (arr, old_index, new_index) => {
            new_index = ((new_index % arr.length) + arr.length) % arr.length;
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }
        let tabs = this.state.tabs
        if (this.tabLocation != null) {
            let tabs_new = array_move(tabs, this.state.selectedTab, this.tabLocation)
            for (let tab in tabs_new) {
                if (tab == this.tabLocation) {
                    tabs_new[tab].selected = true
                } else {
                    tabs_new[tab].selected = false
                }
            }
            let loop = 0
            for (let _tab in tabs_new) {
                if (tabs_new[_tab].selected == true) break
                loop++
            }
            this.setState({tabs: tabs, selectedTabX: 0, selectedTab: this.tabLocation, dragging: false})      
            if (this.props.onChange) {
                this.props.onChange(tabs, loop)
            }
        }

    }
    handleOnClose(title) {
        if(this.props.onClose) {
            this.props.onClose(title)
        }
    }
    renderTabs() {
        let object = []
        let width = 200
        let totalTabs = this.state.tabs.length
        if ((totalTabs * width) > this.state.width) {
            width = this.state.width / totalTabs
        }
        this.width = width
        let loop = 0
        let location = null
        for (let item in this.state.tabs) {
            let data = this.state.tabs[item]
            let boundLeft = width * -loop
            let boundRight = this.state.width - (width * (loop + 1))

            let background = "rgb(110, 207, 255)"
            if (data.background) {
                background = data.background
            }
            let position = { x: 0, y: 0 }
            let zIndex = 20
            let opacity = 1
            if (this.state.selectedTab != loop) {
                opacity = 0.5
                zIndex = 10
                if (this.state.selectedTab > loop && this.state.dragging) {
                    if (this.state.selectedTabX < ((width * loop) + (width / 2))) {
                        position = { x: width, y: 0 }
                        if (location == null) {
                            location = loop
                        }
                    }
                }
                if (this.state.selectedTab < loop && this.state.dragging) {
                    if (this.state.selectedTabX > ((width * loop) - (width / 2))) {
                        position = { x: -width, y: 0 }

                        location = loop
                    }
                }
            }
            object.push(<Draggable
                axis="x"
                key={loop}
                defaultPosition={{ x: 0, y: 0 }}
                position={position}
                onStart={this.handleStart.bind(this, loop, data.title)}
                onDrag={this.handleDrag.bind(this, loop)}
                onStop={this.handleStop.bind(this, loop)}
                bounds={{ 'left': boundLeft, 'right': boundRight }}>
                <div className="item handle" style={{ position: 'relative', zIndex: zIndex, backgroundColor: background, opacity: opacity,  }}>
                    <div className="label-c text" style={{fontWeight: "bold"}}>{data.title}</div>

                    <div id="selection-indicator"></div>
                    <svg id="close-button" viewBox="0 0 100 100" preserveAspectRatio="none"  onClick={this.handleOnClose.bind(this,data.title)}>
                        <path id="close-button-path"></path>
                    </svg>
                </div>
            </Draggable>)
            loop++
        }
        this.tabLocation = location
        return object;
    }
    updateDimensions() {
        var width = ReactDOM.findDOMNode(this.refs.area).getBoundingClientRect().width
        //////console.log(width)
        this.setState({ width: width });
    }
    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        this.updateDimensions();
    }
    componentWillReceiveProps(newProps) {
        ////console.log("NEW PROPS")
        ////console.log(newProps)
        ////console.log(this.props)

        if (this.props.tabs) {
            this.updateDimensions();
            ////console.log("updated")
            this.setState({ tabs: this.props.tabs })
        }
        if (this.props.selected != newProps.selected) {
            for (let a in this.state.tabs) {
                if (this.state.tabs[a].title == newProps.selected) {
                    this.setState({ selectedTab: a})
                }
            }
        } 
        if (this.props.remove != newProps.remove) {
            for (let a in this.state.tabs) {
                if (this.state.tabs[a].title == newProps.remove) {
                    let tabs = this.state.tabs
                    tabs.splice(a, 1);
                    ////console.log(tabs)
                    let selected = null
                    let total = tabs.length - 1
                    if (a-1 > 0) {
                        selected = a - 1
                    } else if (a+1 == total) {
                        selected = a + 1
                    } 
                    this.setState({ selectedTab: selected, tabs: tabs})
                    this.props.onChange(this.state.tabs)
                }
            }
        } 
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }


    render() {
        return <div>
            <Layout.Grid canvas>
                <Layout.Grid col>
                    <Layout.Grid col height="50px" width="100%" ref="area">
                        {this.renderTabs()}
                    </Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        </div>
    }
}


