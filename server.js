const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const driveService = require("./driveService"); // Asegúrate de que driveService.js esté en el mismo directorio
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Configuración de CORS (ajusta FRONTEND_URL si es necesario)
app.use(cors({
  origin: "*", // Permitir todos los orígenes
  credentials: true
}));

app.use(express.json());

// SERVICIO DE ARCHIVOS ESTÁTICOS
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});
app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "styles.css"));
});

// Configuración de multer con validación de tipos de archivo
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 60 * 1024 * 1024 }, // Límite de 60 MB
  fileFilter: (req, file, cb) => {
    const validMimes = ["image/jpeg", "image/png", "image/gif"];
    cb(null, validMimes.includes(file.mimetype));
  }
}).array("files", 15); // Máximo 10 archivos

// Endpoint para subir archivos a Drive sin autenticación del usuario
app.post("/upload-multiple", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: "Error en la subida de archivos: " + err.message });
      }
      if (!req.files || !req.files.length) {
        return res.status(400).json({ error: "No se han enviado archivos." });
      }

      const uploadResults = await Promise.all(
        req.files.map(async file => {
          const result = await driveService.subirArchivo(file.path);
          fs.unlinkSync(file.path); // Eliminar el archivo temporal
          return result;
        })
      );

      res.json({ uploadedFiles: uploadResults });
    } catch (error) {
      // Si hay error, eliminar archivos temporales si existen
      req.files?.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });

      res.status(500).json({
        error: "Error en la subida de archivos",
        details: process.env.NODE_ENV === "development" ? error.message : null
      });
    }
  });
});

// (Opcional) Endpoint para listar archivos en Drive
app.get("/files", async (req, res) => {
  try {
    const files = await driveService.listarFotos(process.env.GOOGLE_DRIVE_FOLDER_ID);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo archivos" });
  }
});

// Ruta de verificación de salud
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor listo en: http://localhost:${port}`);
});
