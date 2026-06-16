const bcrypt = require("bcrypt");

bcrypt.hash("Benderang1", 10)
    .then(hash => {
        console.log(hash);
    });