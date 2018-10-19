Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("react")
    let ReactDOM = require("react-dom")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent } = require("@blueprintjs/core")
    let uuidV4 = require("uuid/v4")
    let { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd')
    let AceEditor = require("react-ace").default
    let ace = require("brace")
    let AceCollabExt = require("@convergence/ace-collab-ext")
    console.log(uuidV4())
    let editorName = uuidV4()
    class Equations extends React.Component {
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.props.close()
            }
        }
        constructor(props) {
            super(props);
            this.state = {
                code: `// type your code...
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                `,
            }
        }
        componentDidMount() {
            const editor = ace.edit("editor");
            const curMgr = new AceCollabExt.AceMultiCursorManager(editor.getSession());
            console.log(curMgr)
            // Add a new remote cursor with an id of "uid1", and a color of orange.
            curMgr.addCursor("uid1", "User 1", "orange", {row: 2, column: 20});
            
      

        }
        onChange(newValue) {
            this.setState({ code: newValue })
            console.log('change', newValue);
        }
        render() {
            return <Layout.Grid row>
                <Layout.Grid>
                    <AceEditor
                        mode="javascript"
                        theme="solarized_dark"
                        name="editor"
                        value={this.state.code}
                        onChange={this.onChange.bind(this)}
                        height={`${this.props.height + - 500}px`}
                        width={`${this.props.width}px`}
                        showPrintMargin={false}
                    />
                </Layout.Grid>
                <Layout.Grid background="#5e6268" height="100%">
                    Console
                </Layout.Grid>
            </Layout.Grid>

        }
    }
    //console.log(uuidV4())
    imports.api.page.register(Equations)

})
Observo.register(null, {
    GLOBAL: {},
})