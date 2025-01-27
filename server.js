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
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se subió ningún archivo.");
  }

  const filePath = req.file.path; // Ruta del archivo temporal
  const fileName = req.file.originalname; // Nombre original del archivo
  const mimeType = req.file.mimetype; // Tipo MIME del archivo

  try {
    const fileMetadata = {
      name: fileName,
      parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"], // Reemplaza con el ID de tu carpeta en Drive
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath), // Leer el archivo desde el sistema
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    // Borra el archivo temporal una vez subido
    fs.unlinkSync(filePath);

    res.json({ fileId: response.data.id, fileName: fileName });
  } catch (err) {
    console.error("Error al subir a Google Drive:", err.message);
    res.status(500).send("Error al subir el archivo a Google Drive.");
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
