/**
 * Events Manager
 * @author ImportProgam
 */
Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("react")
    let ReactDOM = require("react-dom")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent, MenuItem, Classes, Dialog, Switch } = require("@blueprintjs/core")
    let { DateRangeInput } = require("@blueprintjs/datetime")
    let uuidV4 = require("uuid/v4")
    let BigCalendar = require("react-big-calendar")
    let moment = require("moment")
    let Autosuggest = require("react-autosuggest")
    let AutosuggestHighlightMatch = require('autosuggest-highlight/match')
    let AutosuggestHighlightParse = require('autosuggest-highlight/parse')
    const localizer = BigCalendar.momentLocalizer(moment)




    class EventQuestion extends React.Component {
        constructor() {
            super()
            this.state = {
                disabled: true,
                event: null
            }
        }
        onCancel() {
            if (this.props.onClose) {
                this.props.onClose(false)
            }
        }
        onConfirm() {
            if (this.props.onClose) {
                this.props.onClose(true)
            }
        }
        render() {
            return <Dialog
                intent={Intent.DANGER}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
                title="hello"

                isOpen={this.props.isOpen}
                usePortal={false}
            >
                <div className={Classes.DIALOG_BODY}>
                    <p>
                        Please wait while the events are fetched...
                    </p>

                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={this.onConfirm.bind(this)} intent={Intent.SUCCESS} disabled={this.state.disabled}>Okay</Button>
                    </div>
                </div>
            </Dialog>

        }
    }


    class EventSuggest extends React.Component {
        constructor() {
            super()

            this.state = {
                value: '',
                suggestions: [],
                events: []
            }
        }
        getSuggestions(value) {
            const escapedValue = this.escapeRegexCharacters(value.trim())

            if (escapedValue === '') {
                return []
            }

            const regex = new RegExp('\\b' + escapedValue, 'i')

            return this.props.events.filter(event => regex.test(this.getSuggestionValue(event)))
        }
        escapeRegexCharacters(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }
        getSuggestionValue(suggestion) {
            if (suggestion.district != null) {
                return `${suggestion.city} ${suggestion.country} ${suggestion.event_code} ${suggestion.name} ${suggestion.district.abbreviation} `
            }
            return `${suggestion.city} ${suggestion.country} ${suggestion.event_code} ${suggestion.name}`
        }
        getSuggestionValueSimple(suggestion) {
            return `${suggestion.name}|${suggestion.event_code}`
        }
        renderSuggestion(suggestion, { query }) {
            let renderCity = () => {
                let suggestionText = `${suggestion.city}, ${suggestion.country}`
                let matches = AutosuggestHighlightMatch(suggestionText, query)
                let parts = AutosuggestHighlightParse(suggestionText, matches)
                return <span>
                    {
                        parts.map((part, index) => {
                            const className = part.highlight ? 'highlight' : null

                            return (
                                <span className={className} key={index}>{part.text}</span>
                            )
                        })
                    }
                </span>
            }
            let renderName = () => {
                let suggestionText = `${suggestion.name}`
                let matches = AutosuggestHighlightMatch(suggestionText, query)
                let parts = AutosuggestHighlightParse(suggestionText, matches)
                return <span>
                    {
                        parts.map((part, index) => {
                            const className = part.highlight ? 'highlight' : null

                            return (
                                <span className={className} key={index}>{part.text}</span>
                            )
                        })
                    }
                </span>
            }
            let renderCode = () => {
                let suggestionText = `${suggestion.event_code}`
                let matches = AutosuggestHighlightMatch(suggestionText, query)
                let parts = AutosuggestHighlightParse(suggestionText, matches)
                return <span>
                    {
                        parts.map((part, index) => {
                            const className = part.highlight ? 'highlight' : null

                            return (
                                <span className={className} key={index}>{part.text}</span>
                            )
                        })
                    }
                </span>
            }

            return (
                <span className='suggestion-content'>
                    <Layout.Grid row>
                        <Layout.Grid style={{ fontSize: 20 }}>{renderName()}</Layout.Grid>
                        <Layout.Grid height={20} col>
                            <Layout.Grid width="40%" className="center" style={{ color: "gray" }}>
                                {renderCode()}
                            </Layout.Grid>
                            <Layout.Grid width="60%" style={{ fontWeight: "italics", fontSize: 14 }}>
                                {renderCity()}
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>
                </span >
            )
        }
        onChange(event, { newValue, method }) {
            console.log(method)
            if (method != "type") {
                let data = newValue.split("|")
                this.props.usingEvent(data[1])
                this.setState({
                    value: data[0]
                })
                if (this.props.onChange) {
                    this.props.onChange(data[0])
                }
            } else {
                this.setState({
                    value: newValue
                })
                if (this.props.onChange) {
                    this.props.onChange(newValue)
                }
            }


        }

        onSuggestionsFetchRequested({ value }) {
            this.setState({
                suggestions: this.getSuggestions(value)
            })
        }

        onSuggestionsClearRequested() {
            this.setState({
                suggestions: []
            })
        }

        render() {
            const { value, suggestions } = this.state
            const inputProps = {
                placeholder: "Search Events",
                value,
                onChange: this.onChange.bind(this),
                style: {
                    width: 280,
                    height: 52
                }
            }

            return (
                <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                    getSuggestionValue={this.getSuggestionValueSimple}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps} />
            )
        }
    }

    class Events extends React.Component {
        constructor() {
            super()
            this.state = {
                navbarTabId: "events",
                addingEvent: false,
                createdEvents: [],
                events: [
                    {
                        start: new Date(),
                        end: new Date(moment().add(1, "days")),
                        title: "Some title"
                    }
                ],
                startDate: new Date(moment()),
                endDate: new Date(moment().add(1, "days")),
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
                imports.api.auth.use(socketObject)
                imports.api.auth.vaild(socketObject, () => {
                    imports.api.page.usePage(socketObject, this.props.uuid)
                    socketObject.on("events_hasTeams", ({ hasTeams }) => {
                        if (!hasTeams) {
                            console.log("DOES NOT HAVE TEAMS YET")
                            this.setState({ hasTeams: false })
                            socketObject.emit("events_updateTeams")
                        }
                    })
                    socketObject.on("events_updateTeams", ({ events }) => {
                        console.log(events)
                        this.setState({ events, hasTeams: true })
                    })
                    socketObject.on("events_listUpdate", (events) => {
                        console.log(events)
                        this.setState({ createdEvents: events })
                    })
                })

            })
        }
        async handleNavbarTabChange(navbarTabId) {
            this.setState({ navbarTabId })
        }
        async onAddClick() {
            if (this.state.addingEvent) {
                //this.setState({ addingEvent: false })

            } else {
                //this.setState({ addingEvent: true })

            }
        }
        async onRangeChange(data) {
            this.setState({ startDate: data[0], endDate: data[1] })
        }
        async onUsingEvent(code) {
            for (let e in this.state.events) {
                let event = this.state.events[e]
                if (event.event_code == code) {
                    this.setState({ startDate: new Date(event.start_date + " EST"), endDate: new Date(event.end_date + " EST") })
                }
            }
        }
        async onCreateEvent() {
            let data = {
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                name: this.state.eventName,
            }
            this.socketObject.emit("events_addEvent", data)
        }
        renderTabs() {
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
        renderProjectEvents() {
            if (this.state.createdEvents.length > 0) {
                let items = []
                for (let e in this.state.createdEvents) {
                    let event = this.state.createdEvents[e]
                    items.push (<Layout.Grid width="100%" style={{padding: 20, margin: 20}} background="white">
                        <p>{event.name}</p>
                    </Layout.Grid>)
                }
                return items

            } else {
                return <div style={{ "display": "flex", "flexDirection": "column", "flex": "1", "height": "100%" }}>
                    <p style={{ margin: "auto", fontWeight: "bold", fontSize: 50 }}>No events found.</p>
                </div>
            }
        }
        renderEvents() {
            if (this.state.navbarTabId == "events") {
                return <Layout.Grid col height="100%">
                    <Layout.Grid>
                      {this.renderProjectEvents()}
                    </Layout.Grid>
                    <Layout.Grid row background="lightgray" width={600}>
                        <Layout.Grid className="center" width="100%" style={{ margin: 10, padding: 10 }}>
                            <p className="center" style={{ fontWeight: "bold", fontSize: "18", textAlign: "center", width: "100%" }}>Add Event</p>
                        </Layout.Grid>
                        <Layout.Grid col>
                            <Layout.Grid row width={200}>
                                <Layout.Grid style={{ margin: 10, padding: 10 }} height={70}>
                                    <p className="center" style={{ fontWeight: "bold", fontSize: "18", textAlign: "center", width: "100%" }}>Event Name</p>
                                </Layout.Grid>
                                <Layout.Grid style={{ margin: 10, padding: 10 }} height={70}>
                                    <p className="center" style={{ fontWeight: "bold", fontSize: "18", textAlign: "center", width: "100%" }}>Event Time</p>
                                </Layout.Grid>
                            </Layout.Grid>
                            <Layout.Grid row>
                                <Layout.Grid style={{ margin: 10 }} height={70}>
                                    <EventSuggest events={this.state.events} usingEvent={this.onUsingEvent.bind(this)} onChange={value => this.setState({ eventName: value })} />
                                </Layout.Grid>
                                <Layout.Grid style={{ margin: 10 }} height={70}>
                                    <DateRangeInput
                                        maxDate={new Date("12/31/2038")}
                                        endInputProps={{
                                            style: {
                                                height: 52
                                            }
                                        }}
                                        startInputProps={{
                                            style: {
                                                height: 52
                                            }
                                        }}
                                        value={[this.state.startDate, this.state.endDate]}
                                        onChange={this.onRangeChange.bind(this)}
                                        formatDate={date => date.toLocaleString()}
                                        parseDate={str => new Date(str)}
                                    />
                                </Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                        <Layout.Grid className="center" width="100%" style={{ margin: 10, padding: 10 }} col center>
                            <div>
                                <Button style={{
                                    width: 280,
                                    height: 52,
                                    fontWeight: "bold",
                                    fontSize: 24
                                }} intent={Intent.SUCCESS} onClick={this.onCreateEvent.bind(this)}>Create Event</Button>
                            </div>
                        </Layout.Grid>
                    </Layout.Grid>
                </Layout.Grid>
            }
        }
        renderCalendar() {
            if (this.state.navbarTabId == "calendar") {
                let events = this.state.createdEvents
                let calEvents = []
                for (let e in events) {
                    let event = events[e]
                    let data = {
                        title: event.name,
                        start: event.startDate,
                        end: event.endDate,
                        allDay: true,
                    }
                    calEvents.push(data)
                }
                return <Layout.Grid background="white">
                    <BigCalendar
                        localizer={localizer}
                        events={calEvents}
                        startAccessor="start"
                        endAccessor="end"
                    />
                </Layout.Grid>
            }
        }
        renderAddEvent() {
            if (this.state.addingEvent) {
                return <EventCreator events={this.state.events} socket={this.socketObject} />
            }
        }
        render() {
            return <Layout.Grid row style={{ position: "relative" }}>
                <EventQuestion isOpen={!this.state.hasTeams}>
                    <p>
                        Are you sure you wanna exit data collection? <br />
                        All current data in entry fields will be lost.
                     </p>
                </EventQuestion>
                <Layout.Grid>


                    <Navbar style={{ background: "gray" }}>
                        <Navbar.Group align={Alignment.LEFT}>
                            {/* controlled mode & no panels (see h1 below): */}
                            {this.renderTabs()}
                        </Navbar.Group>
                        <Navbar.Group align={Alignment.RIGHT}>
                            <Button className="pt-minimal" icon="cog" />
                        </Navbar.Group>
                    </Navbar>
                </Layout.Grid>
                <Layout.Grid>
                    {this.renderEvents()}
                    {this.renderCalendar()}
                </Layout.Grid>
            </Layout.Grid>
        }
    }


    imports.api.page.register(Events)
    imports.api.page.setOffset({height: -100, width: 0})
})
Observo.register(null, {
    GLOBAL: {},
})