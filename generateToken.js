const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// Carga las credenciales de Google descargadas
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.web;

// Crea un cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Genera un token inicial
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);

      // Guarda el token en un archivo llamado token.json
      fs.writeFileSync("token.json", JSON.stringify(token));
      console.log("Token stored to token.json");
    });
  });
}

getAccessToken(oAuth2Client);
