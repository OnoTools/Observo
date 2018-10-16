var canonicalizeNewlines = function(str) {
    return str.replace(/(\r\n|\r|\n)/g, '\n');
};
let line = ""
let newCode = ""
let codeArray = canonicalizeNewlines(code)
for (let a in codeArray) {
    if (codeArray[a] != "\n") {
        line = `${line}${codeArray[a]}`
    } else {
        if (line.includes("import") && line.includes("from")) {
            line = line.replace(/import/i, 'let');
            line = line.replace(/from/i, '= require(');
            line = line.replace(/ "/i, '"');
            line = line.replace(/" /i, '"');
            line = `${line})`
            console.log("IMPORT")
            console.log(line)
        }
        newCode = `${newCode}${line}\n`
        line = ""
    }
}


async btnClick() {
    /*
    notifier.notify(
        {
          title: 'Observo',
          message: 'Update is Ready!',
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback, until user action is taken against notification
        },
        function(err, response) {
          // Response is response from notification
        }
      );*/
    AppToaster.show({ message: "Toasted." });
}

async updateText(event) {
    this.setState({ text: event.target.value })
}