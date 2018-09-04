class Example extends React.Component {
  render() {
     return React.createElement(
      "p",
      null,
      "Hello this is a react example"
    );
  }
}



Observo.onMount((imports) => {
  console.log("MOUNTED")
  console.log(imports)
  imports.api.page.register(React.createElement(Example, null))
})
Observo.register(null, {
  GLOBAL: {},
})