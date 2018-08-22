//Example (Client) Page
Observo.onMount((imports) => {
    
})
Observo.register(null, {
  GLOBAL: {
      addHandler: (callback) => {
          let name;
          try { throw new Error(); }
          catch (e) {
              var re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
              re.exec(st), m = re.exec(st);
              name = m[1] || m[2];
          }
          console.log(name)
      }
  }
})