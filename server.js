const express = require("express");
const multer = require("multer");
const { google } = 
require("googleapis");
const fs = require("fs");

const app = express();
const PORT = 8080;

//Configuraciones de Multer para manejar los archivos subidos
const upload = multer({ dest:
"uploads/"});

// Carga las credenciales descargadas desde Google Cloud Console
const credentials = JSON.parse(fs.readFileSync("credentials.json"));