Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("react")
    let ReactDOM = require("react-dom")
    let { Tab, Tabs, ProgressBar, Alignment, Navbar, Button, InputGroup, Alert, Intent } = require("@blueprintjs/core")
    let uuidV4 = require("uuid/v4")
    let { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd')
    let MonacoEditor = require("react-monaco-editor")
    let monaco = require("monaco-editor")
    class Equations extends React.Component {
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.props.close()
            }
        }
        constructor(props) {
            super(props);
            this.state = {
                code: '// type your code...',
            }
        }
        editorDidMount(editor, monaco) {
            console.log('editorDidMount', editor);
            editor.focus();
        }
        onChange(newValue, e) {
            console.log('onChange', newValue, e);
        }
        render() {
            const code = this.state.code;
            const options = {
                selectOnLineNumbers: true
            };
            return (
                <MonacoEditor
                    monaco={monaco}
                    width="800"
                    height="600"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={this.onChange.bind(this)}
                    editorDidMount={this.editorDidMounts.bind(this)}
                />
            );
        }
    }
    //console.log(uuidV4())
    imports.api.page.register(Equations)

})
Observo.register(null, {
    GLOBAL: {},
})