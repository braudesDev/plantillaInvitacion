const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config(); // Carga dotenv para leer el archivo .env
const { Readable } = require("stream");

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
app.use(fileUpload());

// Función para listar las últimas 9 fotos de una carpeta en Google Drive
const listarFotos = async (carpetaId) => {
  try {
    const response = await drive.files.list({
      q: `'${carpetaId}' in parents and mimeType contains 'image/' and trashed = false`,
      orderBy: "createdTime desc",
      pageSize: 9,
      fields: "files(id, name)",
    });

    return response.data.files.map((file) => ({
      name: file.name,
      link: `https://drive.google.com/uc?id=${file.id}`, // Usamos el enlace directo a la imagen
    }));
  } catch (err) {
    console.error("Error al listar fotos:", err);
    throw err;
  }
};

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

// Ruta para obtener las fotos más recientes
app.get("/get-latest-photos", async (req, res) => {
  const carpetaId = "1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"; // Reemplaza con el ID de tu carpeta

  try {
    const fotos = await listarFotos(carpetaId);
    res.json(fotos); // Enviar la respuesta como JSON
  } catch (err) {
    console.error("Error al obtener fotos:", err);
    res.status(500).send("Error al obtener las fotos.");
  }
});

// Servir archivos estáticos como el HTML y el CSS (este es redundante, puedes eliminarlo si ya lo tienes arriba)
app.use(express.static("public"));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
