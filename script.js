

AOS.init();

// You can also pass an optional settings object
// below listed default settings
AOS.init({
  // Global settings:
  disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
  startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
  initClassName: 'aos-init', // class applied after initialization
  animatedClassName: 'aos-animate', // class applied on animation
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
  

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});


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
const fechaBoda = new Date('2025-01-30T13:57:00').getTime();

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



// ======================================
// Logica para ver fotos de drive
// ======================================

async function loadPhotos() {
  const response = await fetch("/get-latest-photos");
  const photos = await response.json();

  const gallery = document.getElementById("photoGallery");
  gallery.innerHTML = ""; // Limpiar la galería antes de cargar nuevas fotos

  photos.forEach((photo) => {
    const img = document.createElement("img");
    
    // Usar el id del archivo para generar la URL de la imagen
    img.src = `https://drive.google.com/uc?id=${photo.id}`;
    img.alt = photo.name;
    
    img.classList.add('thumbnail'); // Añadir clase para estilo de miniatura

    gallery.appendChild(img); // Añadir la imagen a la galería
  });
}

loadPhotos(); // Cargar fotos






// ======================================
// Logica para subir fotos a la pagina web
// ======================================

document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  if (fileInput.files.length === 0) {
      status.innerText = 'Por favor, selecciona un archivo.';
      return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  status.innerText = 'Subiendo archivo...';

  try {
      const response = await fetch('/upload', { // Ruta a tu backend
          method: 'POST',
          body: formData,
      });
      const result = await response.json();
      if (response.ok) {
          status.innerText = `Archivo subido. ID: ${result.fileId}`;
      } else {
          throw new Error(result.error || 'Error al subir el archivo.');
      }
  } catch (error) {
      status.innerText = `Error: ${error.message}`;
  }
});



//Variables de entorno

require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;
const secretKey = process.env.SECRET_KEY;

console.log(apiKey); // Mostraría tu token si es necesario (no hacerlo en producción)
