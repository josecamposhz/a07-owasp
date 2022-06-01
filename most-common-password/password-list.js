const fs = require('fs');

// https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt
fs.readFile('./10-million-password-list-top-10000.txt', (err, data) => {
    if (err) console.error(err);
    let list = data.toString().split('\r\n').filter(p => p.length >= 8);
    console.log(list[0])
    fs.writeFile('../password-list.json', JSON.stringify(list), (err) => {
        if (err) console.error(err);
    });
});