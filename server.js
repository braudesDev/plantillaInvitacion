const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config(); // Carga dotenv para leer el archivo .env
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = 8080;

// Servir archivos estáticos (index.html, styles.css, etc.)
app.use(express.static(path.join(__dirname)));

// Crea el cliente OAuth2 usando las variables del .env
const oAuth2Client = new google.auth.OAuth2(
  process.env.WEB_CLIENT_ID,
  process.env.WEB_CLIENT_SECRET,
  process.env.WEB_REDIRECT_URIS
);

// Crea el objeto token con los valores del .env
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

// Middleware para manejar archivos subidos
app.use(
  fileUpload({
    useTempFiles: true, // Habilita el uso de archivos temporales
    tempFileDir: "/tmp/", // Carpeta temporal para almacenar archivos
  })
);


// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Función para subir a Cloudinary
const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "fotosInvitacion",
  });
  return result.secure_url;
};

// Ruta para subir archivos a Cloudinary y Google Drive simultáneamente
app.post("/upload-both", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No se ha subido ningún archivo.");
  }

  const file = req.files.file;

  try {
    // Subida a Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file.tempFilePath);
    console.log("Subida a Cloudinary exitosa:", cloudinaryResult);

    // Subida a Google Drive
    const readableStream = new Readable();
    readableStream.push(file.data);
    readableStream.push(null);

    const media = {
      mimeType: file.mimetype,
      body: readableStream,
    };

    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"], // Reemplaza con el ID de tu carpeta
      },
      media: media,
    });

    console.log("Subida a Google Drive exitosa:", driveResponse.data.name);

    // Respuesta con ambas URLs
    res.json({
      cloudinaryUrl: cloudinaryResult,
      driveFileName: driveResponse.data.name,
      message: "Imagen subida a ambos servicios exitosamente",
    });
  } catch (error) {
    console.error("Error al subir los archivos:", error);
    res.status(500).send("Error al subir los archivos.");
  }
});

// Ruta para subir archivos a Google Drive
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;

  try {
    // Crear un stream a partir de file.data
    const readableStream = new Readable();
    readableStream.push(file.data); // Usamos el contenido del archivo en un stream
    readableStream.push(null); // Indica el final del stream

    const media = {
      mimeType: file.mimetype,
      body: readableStream, // Usamos el stream como cuerpo del archivo
    };

    const response = await drive.files.create({
      requestBody: {
        name: file.name, // Nombre del archivo en Drive
        parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"], // Reemplaza con el ID de tu carpeta
      },
      media: media, // Se usa el objeto media con el cuerpo (stream) del archivo
    });

    if (response.status !== 200) {
      throw new Error(`Error al subir archivo a Google Drive: ${response.statusText}`);
    }

    res.send(`Archivo subido exitosamente: ${response.data.name}`);
  } catch (err) {
    console.error("Error al subir a Drive:", err);
    res.status(500).send("Error al subir el archivo.");
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
