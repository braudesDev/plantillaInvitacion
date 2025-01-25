require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Función para subir imágenes a Cloudinary
async function uploadToCloudinary(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url; // URL segura de la imagen
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    throw error;
  }
}

module.exports = {
  uploadToCloudinary
};
