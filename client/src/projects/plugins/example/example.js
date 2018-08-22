class Example extends React.Component {
  render() {
    return <p>Hello this is a react example</p>
  }
}



Observo.onMount((imports) => {
  console.log("MOUNTED")
  console.log(imports)
  imports.api.page.register(<Example />)
})
Observo.register(null, {
  GLOBAL: {},
})