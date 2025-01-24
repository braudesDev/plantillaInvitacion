const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path"); // Importa 'path' para manejar rutas de manera correcta
const { google } = require("googleapis");

const app = express();
const port = 8080;

// Servir archivos estáticos (index.html, styles.css, etc.) desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Carga las credenciales y el token generado
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const token = JSON.parse(fs.readFileSync("token.json"));

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);
oAuth2Client.setCredentials(token);

// Configura la API de Google Drive
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// Middleware para manejar archivos subidos
app.use(fileUpload());

// Ruta para subir archivos a Google Drive
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;

  try {
    // Crea un archivo temporal para manejar el flujo del archivo
    const tempFilePath = path.join(__dirname, file.name);
    await fs.promises.writeFile(tempFilePath, file.data);

    // Sube el archivo a Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name, // Nombre del archivo en Drive
        parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"], // Reemplaza con el ID de tu carpeta
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(tempFilePath),
      },
    });

    // Borra el archivo temporal después de subirlo
    await fs.promises.unlink(tempFilePath);

    res.send(`Archivo subido exitosamente: ${response.data.name}`);
  } catch (err) {
    console.error("Error al subir a Drive:", err);
    res.status(500).send("Error al subir el archivo.");
  } 
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
