const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const router = express.Router();

// Configurar Google Drive
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const token = JSON.parse(fs.readFileSync("token.json"));

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);
oAuth2Client.setCredentials(token);

const drive = google.drive({ version: "v3", auth: oAuth2Client });

router.use(fileUpload());

// Ruta para subir archivos
router.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;

  try {
    const tempFilePath = path.join(__dirname, file.name);
    await fs.promises.writeFile(tempFilePath, file.data);

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: ["1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ"],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(tempFilePath),
      },
    });

    await fs.promises.unlink(tempFilePath);

    res.send(`Archivo subido exitosamente: ${response.data.name}`);
  } catch (err) {
    console.error("Error al subir a Drive:", err);
    res.status(500).send("Error al subir el archivo.");
  }
});

// Ruta para obtener las últimas 9 fotos
router.get("/latest-photos", async (req, res) => {
    try {
      const response = await drive.files.list({
        q: "'1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ' in parents and mimeType contains 'image/'",
        pageSize: 9,
        fields: "files(id, name, webContentLink)",
        orderBy: "createdTime desc",
      });
  
      const files = response.data.files.map((file) => ({
        id: file.id,
        name: file.name,
        link: `https://drive.google.com/uc?export=view&id=${file.id}`, // Modificar la URL para que sea accesible
      }));

      onsole.log("Files from Drive:", files); // Verifica que los archivos estén llegand
      res.json(files);
    } catch (err) {

      res.status(500).send("Error al obtener las fotos.");
    }
  });
  

module.exports = router;
