const { google } = require("googleapis");
const fs = require("fs");

// Read Google credentials
const credentials = JSON.parse(
    fs.readFileSync("credentials.json")
);

// Read saved token
const token = JSON.parse(
    fs.readFileSync("token.json")
);

// Create OAuth client
const oAuth2Client =
    new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0]
    );

// Load refresh token
oAuth2Client.setCredentials(token);

// Create Calendar API object
const calendar = google.calendar({
    version: "v3",
    auth: oAuth2Client
});

// Export it so server.js can use it
module.exports = calendar;