const { google } = require("googleapis");
require("dotenv").config();

// Configurar cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.WEB_CLIENT_ID,
  process.env.WEB_CLIENT_SECRET,
  process.env.WEB_REDIRECT_URIS
);

// Configurar tokens
const token = {
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
  scope: process.env.SCOPE,
  token_type: process.env.TOKEN_TYPE,
  expiry_date: process.env.EXPIRY_DATE,
};

oAuth2Client.setCredentials(token);

// Crear cliente de Google Drive
const drive = google.drive({ version: "v3", auth: oAuth2Client });

/**
 * Función para subir un archivo a Google Drive
 * @param {string} fileName - Nombre del archivo.
 * @param {string} mimeType - Tipo MIME del archivo (ej., 'image/jpeg').
 * @param {Buffer} fileData - Datos del archivo (como Buffer o Stream).
 * @param {string} folderId - ID de la carpeta de Google Drive (opcional).
 */
async function subirArchivo(fileName, mimeType, fileData, folderId = null) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [], // Agrega el archivo a la carpeta si folderId existe
    };

    const media = {
      mimeType: mimeType,
      body: fileData, // Puede ser un ReadStream o Buffer
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name",
    });

    console.log(`Archivo subido con éxito. ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error("Error al subir archivo:", error.message);
    throw error;
  }
}

/**
 * Función para listar archivos en Google Drive
 * @param {string} folderId - ID de la carpeta (opcional).
 */
async function listarFotos(folderId = null) {
  try {
    const query = folderId ? `'${folderId}' in parents` : ""; // Filtra por carpeta si se proporciona un ID
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    if (response.data.files.length === 0) {
      console.log("No se encontraron archivos.");
      return [];
    }

    console.log("Archivos encontrados:");
    response.data.files.forEach((file) => {
      console.log(`- ${file.name} (ID: ${file.id})`);
    });

    return response.data.files;
  } catch (error) {
    console.error("Error al listar archivos:", error.message);
    throw error;
  }
}

// Exportar funciones
module.exports = {
  subirArchivo,
  listarFotos,
};
