/**
 * Settings Page
 * 
 * @author ImportProgram
 */
import { Component } from "react"
export default class Settings extends Component {
    componentWillReceiveProps(nextProps) {
        console.log("got props")
        if (this.props.onClose != nextProps.onClose) {
            console.log("settings closing tab")
            this.props.close()
        }
    }
    render() {
        return <p>Settings Page</p>
    }
}