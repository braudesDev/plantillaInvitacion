const { google } = require("googleapis");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Scopes necesarios para acceder a Google Drive
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',  // Acceso solo a archivos creados por la app
  'https://www.googleapis.com/auth/drive'        // Acceso completo a Google Drive
];

// Configuración de OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,     // ID de cliente
  process.env.GOOGLE_CLIENT_SECRET, // Secreto de cliente
  process.env.REDIRECT_URI         // URI de redirección configurada en Google Cloud
);

// Asignar credenciales preconfiguradas (al menos el refresh_token)
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Crear cliente de Google Drive
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// Función para renovar el token de acceso si es necesario
async function refreshAccessToken() {
  try {
    // Asegurar que siempre haya un refresh_token
    if (!oAuth2Client.credentials.refresh_token) {
      oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    }

    const { token } = await oAuth2Client.getAccessToken();
    if (!token) throw new Error("❌ No se pudo obtener un nuevo access_token.");

    console.log("✅ Token renovado correctamente.");
    return token;
  } catch (error) {
    console.error("❌ Error al renovar el token:", error.message);
    throw error;
  }
}

// Función para subir un archivo a Google Drive
async function subirArchivo(filePath, folderId = process.env.GOOGLE_DRIVE_FOLDER_ID) {
  try {
    const accessToken = await refreshAccessToken(); // Renueva token antes de subir archivo
    oAuth2Client.setCredentials({ access_token: accessToken });

    const fileName = path.basename(filePath);
    const mimeType = getMimeType(fileName);

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : []
    };

    const media = {
      mimeType,
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, webViewLink, webContentLink"
    });

    console.log("✅ Archivo subido con éxito:", response.data.name);
    return {
      id: response.data.id,
      name: response.data.name,
      url: response.data.webViewLink || response.data.webContentLink
    };
  } catch (error) {
    console.error("❌ Error subiendo archivo:", error.response ? error.response.data : error.message);
    throw error;
  }
}

// Función para listar archivos de Google Drive
async function listarFotos(folderId = null, pageSize = 10) {
  try {
    await refreshAccessToken(); // Renueva el token antes de listar archivos

    const query = folderId ? `'${folderId}' in parents` : "";
    const response = await drive.files.list({
      q: query,
      pageSize,
      fields: "files(id, name, webViewLink, webContentLink), nextPageToken"
    });

    return response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      url: file.webViewLink || file.webContentLink
    }));
  } catch (error) {
    console.error("❌ Error listando archivos:", error.message || error);
    throw error;
  }
}

// Helper para determinar el MIME type según la extensión del archivo
function getMimeType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    txt: 'text/plain'
  };
  return mimeTypes[extension] || 'application/octet-stream'; // Retorna tipo por defecto si no encuentra
}

module.exports = {
  subirArchivo,
  listarFotos,
  refreshAccessToken
};
