Observo.onMount((imports) => {
    let require = imports.api.require.use
    let { Layout } = require("@importcore/crust")
    let React = require("React")
    
    //let a = imports.api.socket.use()
    class Example extends React.Component {
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.props.close()
            }
        }
        render() {
            return <p>Visuals</p>
        }
    }


    imports.api.page.register(Example)

})
Observo.register(null, {
    GLOBAL: {},
})