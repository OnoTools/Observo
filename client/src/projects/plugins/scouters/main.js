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
        componentDidMount() {
            let socketObject = imports.api.socket.use(null)
            this.socketObject = socketObject
            socketObject.on("connect", () => {
                imports.api.auth.use(socketObject)
                imports.api.auth.vaild(socketObject, () => {
                    imports.api.page.usePage(socketObject, this.props.uuid)
                    socketObject.on("scouters_updateList", () => {

                    })
                    socketObject.on("scouter_addToList", () => {

                    })
                })
            })
        }
        render() {
            return <p>Scouters</p>
        }
    }


    imports.api.page.register(Example)

})
Observo.register(null, {
    GLOBAL: {},
})