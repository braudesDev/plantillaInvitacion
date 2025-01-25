const express = require("express");
const router = express.Router();

// Simulación de una base de datos
const photos = [
  { id: 1, url: "/images/photo1.jpg", title: "Foto 1" },
  { id: 2, url: "/images/photo2.jpg", title: "Foto 2" },
  { id: 3, url: "/images/photo3.jpg", title: "Foto 3" },
  // Agrega más fotos
];

// Ruta para obtener las últimas fotos
router.get("/photos", (req, res) => {
  const limit = parseInt(req.query.limit) || 9; // Número de fotos a devolver
  const lastPhotos = photos.slice(-limit).reverse(); // Últimas fotos
  res.json(lastPhotos);
});

module.exports = router;
