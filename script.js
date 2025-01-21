//================================
//Carrusel de fotos
//================================
document.addEventListener("DOMContentLoaded", () => {
  const imagenes = document.querySelectorAll("#imagen-principal .carrusel img");
  let indiceActual = 0;

  setInterval(() => {
      // Quitar clase activa de la imagen actual
      imagenes[indiceActual].classList.remove("activa");

      // Avanzar al siguiente índice (o volver al inicio si es la última imagen)
      indiceActual = (indiceActual + 1) % imagenes.length;

      // Agregar clase activa a la nueva imagen
      imagenes[indiceActual].classList.add("activa");
  }, 5000); // Cambiar cada 3 segundos
});



// ===============================
// Contador regresivo para la boda
// ===============================

// Obtener la fecha de la boda
const fechaBoda = new Date('2025-01-21T13:57:00').getTime();

// Seleccionar los elementos del DOM
const diasEl = document.getElementById('dias');
const horasEl = document.getElementById('horas');
const minutosEl = document.getElementById('minutos');
const segundosEl = document.getElementById('segundos');
const contadorEl = document.getElementById('contador');
const mensajeEl = document.querySelector('.mensaje');

// Función para actualizar el contador
function actualizarContador() {
    const ahora = new Date().getTime();
    const diferencia = fechaBoda - ahora;

    if (diferencia <= 0) {
        // Mostrar mensaje cuando el evento haya comenzado
        mensajeEl.textContent = "¡Es Hoy! ¡Es Hoy! ";
        contadorEl.style.display = "none"; // Ocultar el contador si prefieres
        return;
    }

    // Calcular días, horas, minutos y segundos
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    // Actualizar el DOM con los valores
    diasEl.textContent = dias;
    horasEl.textContent = horas;
    minutosEl.textContent = minutos;
    segundosEl.textContent = segundos;
}

// Iniciar el contador con actualizaciones cada segundo
setInterval(actualizarContador, 1000);

// ======================================
// Modal para visualizar imágenes grandes
// ======================================

// Obtener los elementos del DOM
const modal = document.querySelector(".modal"); // Seleccionar el modal por su clase
const modalImage = document.getElementById("imagenModal"); // Seleccionar la imagen del modal
const images = document.querySelectorAll(".contenedor-galeria img"); // Seleccionar todas las imágenes de la galería
const closeBtn = document.querySelector(".close"); // Seleccionar el botón para cerrar

document.addEventListener("DOMContentLoaded", () => {
  modal.style.display = "none"; // Ocultar el modal de forma segura
});


// Abrir el modal al hacer clic en una imagen
images.forEach((img) => {
  img.addEventListener("click", () => {
    modal.style.display = "block"; // Mostrar el modal
    modalImage.src = img.src; // Pasar la URL de la imagen clickeada al modal
  });
});

// Cerrar el modal al hacer clic en el botón de cierre
closeBtn.addEventListener("click", () => {
  modal.style.display = "none"; // Ocultar el modal
});

// Cerrar el modal al hacer clic fuera de la imagen
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none"; // Ocultar el modal si se hace clic fuera de la imagen
  }
});
