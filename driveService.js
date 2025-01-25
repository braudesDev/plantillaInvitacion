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

// Función para listar las fotos en una carpeta de Google Drive
async function listarFotos(carpetaId) {
  try {
    const response = await drive.files.list({
      q: `'${carpetaId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, mimeType)",
      orderBy: "createdTime desc", // Ordenar por las últimas subidas
      pageSize: 9, // Limitar a 9 fotos
    });

    return response.data.files.map((file) => ({
      name: file.name,
      link: file.webViewLink,
      mimeType: file.mimeType,
    }));
  } catch (err) {
    console.error("Error al listar fotos:", err);
    throw err;
  }
}

// Exportar funciones
module.exports = {
  listarFotos,
};
