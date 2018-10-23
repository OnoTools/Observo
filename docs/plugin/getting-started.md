# Observo Plugin API v2.0

The Observo Plugin API architecture is using define.js as the main plugin/api loader with some tweaks. 

## Getting Started (CLIENT APIs)
Client offers these main APIs. Usually all are used for proper client plugin operations
- authentication (auth for short)
- page
- require
- socket

Also having good understanding of React is needed as Observo is built on React. Plus understanding basic socket.io events are needed if you plan on doing anything realtime.

## How to use an API
With defined.js you create a folder within the plugins folder.
The folder needs to include a javascript file with a name of your choice, and a package.json file. Example tree:
```
->plugins
    -> myplugin
        + myplugin.js
        + package.json
```
Now inside the package.json file we need to include the main base structure:
```json
{
    "name": "myplugin",
    "version": "1.0.0",
    "main": "myplugin.js",
    "consumes": ["api:socket", "api:page", "api:require", "api:auth"]
}
```
This file include the nodes of 
```
name: Name of the plugin 
version: Version of plugin, using SEMVER 
main: The file in the folder with this package, in the example above its myplugin.js
consumes: Thi is where you can important APIs and PLUGINS if want to.
- api:<NAME> will important any API
- plugins:<NAME> will import any plugin if used. Not recommended for client use.
- NAME is the "name" in package.json of API or PLUGINS
```

### Template Client Code
```jsx
//Create a Mount point for the plugin.
Observo.onMount((imports) => {
    //Now use the custom REQUIRE API for require. Normal REQUIRE from COMMONJS is blocked by default
    let require = imports.api.require.use
    let React = require("react") //Lets use REACT

    //Lets create a component class
    class Example extends React.Component {
        //Lets add a custom prop update for closing this plugin (aka page) in Observo. Allows the plugin to do "onclose" things, like close sockets for example
        componentWillReceiveProps(nextProps) {
            if (this.props.onClose != nextProps.onClose) {
                this.props.close()
            }
        }
        //Normal render method form react
        render() {
            return <p>Data</p>
        }
    }

    //Register this React Class into Observo
    imports.api.page.register(Example)

})
//Register this module. Still required if not being used
Observo.register(null, {
    GLOBAL: {},
})



```