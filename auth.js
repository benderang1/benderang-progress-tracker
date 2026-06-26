const { google } = require("googleapis");
const fs = require("fs");

const credentials = JSON.parse(fs.readFileSync("credentials.json"));

const { client_id, client_secret, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

const code =
  "4/0AdkVLPz5cthqTtDt5oOlZcrQokSJPmbsQJy5gxe1GykLQOCyiyb9vDcL1uttyonwuODLAQ&";

async function main() {
  const { tokens } = await oAuth2Client.getToken(code);

  fs.writeFileSync("token.json", JSON.stringify(tokens));

  console.log("token.json created");
}

main();
