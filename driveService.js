const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.WEB_CLIENT_ID,
  process.env.WEB_CLIENT_SECRET,
  process.env.WEB_REDIRECT_URIS
);

const token = {
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
  scope: process.env.SCOPE,
  token_type: process.env.TOKEN_TYPE,
  expiry_date: process.env.EXPIRY_DATE,
};

oAuth2Client.setCredentials(token);

const drive = google.drive({ version: "v3", auth: oAuth2Client });


// Exportar funciones
module.exports = {
  listarFotos,
};
