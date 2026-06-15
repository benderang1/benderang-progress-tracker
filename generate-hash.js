const bcrypt = require("bcrypt");

bcrypt.hash("Benderang9", 10)
    .then(hash => {
        console.log(hash);
    });