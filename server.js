const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config(); // Carga las variables del archivo .env

const app = express();
const port = 8080;

// Servir archivos estáticos (index.html, styles.css, etc.)
app.use(express.static(path.join(__dirname)));

// Configurar Google OAuth2
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

// Configura la API de Google Drive
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// Configuración de multer para subir archivos
const upload = multer({
  dest: "uploads/", // Carpeta donde se guardarán los archivos temporalmente
});

// Ruta para subir archivos a Google Drive
app.post("/upload-multiple", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ error: "No se subió ningún archivo." });
  }

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const filePath = file.path; // Ruta del archivo temporal
      const fileName = file.originalname; // Nombre original del archivo
      const mimeType = file.mimetype; // Tipo MIME del archivo

      const fileMetadata = {
        name: fileName,
        parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"], // Reemplaza con el ID de tu carpeta en Drive
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      // Borra el archivo temporal después de subirlo
      fs.unlinkSync(filePath);

      // Agregar datos del archivo subido a la lista
      uploadedFiles.push({
        fileId: response.data.id,
        fileName: fileName,
      });
    }

    res.json({ uploadedFiles });
  } catch (err) {
    console.error("Error al subir archivos a Google Drive:", err.message);
    res.status(500).send({ error: "Error al subir archivos a Google Drive." });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
