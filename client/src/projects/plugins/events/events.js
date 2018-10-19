/**
 * Events Manager
 * @author ImportProgam
 */
Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("react")
    let ReactDOM = require("react-dom")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes } = require("@blueprintjs/core")
    let { Suggest } = require("@blueprintjs/select")
    let uuidV4 = require("uuid/v4")
    let BigCalendar = require("react-big-calendar")
    let moment = require("moment")


    const localizer = BigCalendar.momentLocalizer(moment)



    class Events extends React.Component {
        constructor() {
            super()
            this.state = {
                navbarTabId: "events",
                addingEvent: false,
                events: [
                    {
                        start: new Date(),
                        end: new Date(moment().add(1, "days")),
                        title: "Some title"
                    }
                ]
            }
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.props.close()
            }
        }
        componentDidMount() {
            let socketObject = imports.api.socket.use(null)
            this.socketObject = socketObject
            socketObject.on("connect", () => {
                console.log("connecting")
                imports.api.auth.use(socketObject)
                imports.api.auth.vaild(socketObject, () => {
                    //alert("vaild user")
                })
            })
        }
        async handleNavbarTabChange(navbarTabId) {
            this.setState({ navbarTabId })
        }
        async onAddClick() {
            if (this.state.addingEvent) {
                this.setState({ addingEvent: false })
            } else {
                this.setState({ addingEvent: true })
            }
        }
        renderTabs() {
            if (!this.state.addingEvent) {
                return <Tabs
                    animate={false}
                    id="navbar"
                    large={true}
                    onChange={this.handleNavbarTabChange.bind(this)}
                    selectedTabId={this.state.navbarTabId}

                >
                    <Tab id="events" title="Events" ></Tab>
                    <Tab id="calendar" title="Calendar" ></Tab>
                </Tabs>
            }
        }
        renderEvents() {
            if (!this.state.addingEvent && this.state.navbarTabId == "events") {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>No events found.</p>
                </div>
            }
        }
        renderCalendar() {
            if (!this.state.addingEvent && this.state.navbarTabId == "calendar") {
                return <Layout.Grid background="white">
                    <BigCalendar
                        localizer={localizer}
                        events={this.state.events}
                        startAccessor="start"
                        endAccessor="end"
                    />
                </Layout.Grid>
            }
        }
        renderAddEvent() {
            if (this.state.addingEvent) {
                return <p>helo</p>
            }
        }
        render() {
            return <Layout.Grid row>
                <Layout.Grid>
                    <Navbar style={{ background: "gray" }}>
                        <Navbar.Group align={Alignment.LEFT}>
                            {/* controlled mode & no panels (see h1 below): */}
                            {this.renderTabs()}
                        </Navbar.Group>
                        <Navbar.Group align={Alignment.RIGHT}>
                            <Button className="pt-minimal" icon="add" onClick={this.onAddClick.bind(this)} />
                        </Navbar.Group>
                    </Navbar>
                </Layout.Grid>
                <Layout.Grid>
                    {this.renderEvents()}
                    {this.renderCalendar()}
                    {this.renderAddEvent()}
                </Layout.Grid>
            </Layout.Grid>
        }
    }


    imports.api.page.register(Events)

})
Observo.register(null, {
    GLOBAL: {},
})