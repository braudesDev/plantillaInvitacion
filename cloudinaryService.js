const cloudinary = require("cloudinary").v2;

// Configuración de Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Función para subir imágenes a Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "fotosInvitacion", // Nombre de la carpeta en Cloudinary
    });
    return result.secure_url; // URL segura de la imagen subida
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
};
