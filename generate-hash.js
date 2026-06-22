const bcrypt = require("bcrypt");

bcrypt.hash("Benderang0310", 10)
    .then(hash => {
        console.log(hash);
    });