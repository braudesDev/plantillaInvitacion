

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
  if (imagenes.length === 0) return; // Verifica si hay imágenes antes de ejecutar el carrusel

  let indiceActual = 0;

  setInterval(() => {
      // Quitar clase activa de la imagen actual
      imagenes[indiceActual].classList.remove("activa");

      // Avanzar al siguiente índice (o volver al inicio si es la última imagen)
      indiceActual = (indiceActual + 1) % imagenes.length;

      // Agregar clase activa a la nueva imagen
      imagenes[indiceActual].classList.add("activa");
  }, 3000); // Cambia cada 5 segundos
});




// ===============================
// Contador regresivo para la boda
// ===============================

// Inicializar AOS
AOS.init();

// Obtener la fecha de la boda
const fechaBoda = new Date('2025-02-15T13:57:00').getTime();

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
        mensajeEl.textContent = "¡Es Hoy! ¡Es Hoy!";
        contadorEl.style.display = "none"; // Ocultar el contador si prefieres
        return;
    }

    // Calcular días, horas, minutos y segundos
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    // Actualizar el DOM con los valores
    actualizarNumero(diasEl, dias);
    actualizarNumero(horasEl, horas);
    actualizarNumero(minutosEl, minutos);
    actualizarNumero(segundosEl, segundos);
}

// Función para actualizar un número con animación
function actualizarNumero(elemento, nuevoValor) {
    if (elemento.textContent !== nuevoValor.toString()) {
        elemento.classList.add('cambio'); // Añadir clase para animar
        setTimeout(() => elemento.classList.remove('cambio'), 200); // Eliminar clase tras la animación
        elemento.textContent = nuevoValor;
    }
}

// Iniciar el contador con actualizaciones cada segundo
setInterval(actualizarContador, 1000);



// ======================================
// Modal para visualizar imágenes grandes
// ======================================

// Obtener los elementos del DOM
const modal = document.querySelector(".modal");
const modalImage = document.getElementById("imagenModal");
const images = document.querySelectorAll(".contenedor-galeria img");
const closeBtn = document.querySelector(".close");

// Función para abrir el modal con animación
const abrirModal = (imgSrc) => {
  modalImage.src = imgSrc; // Asignar la imagen seleccionada
  modal.style.display = "flex"; // Asegurar que el modal esté visible
  setTimeout(() => modal.classList.add("show"), 10); // Agregar animación de apertura
};

// Función para cerrar el modal con animación
const cerrarModal = () => {
  modal.classList.remove("show"); // Iniciar animación de cierre
  setTimeout(() => {
    modal.style.display = "none"; // Ocultar completamente después de la animación
  }, 300); // Tiempo igual a la transición en CSS
};

// Evento para abrir el modal cuando se hace clic en una imagen
images.forEach((img) => {
  img.addEventListener("click", () => abrirModal(img.src));
});

// Evento para cerrar el modal al hacer clic en el botón de cierre
closeBtn.addEventListener("click", cerrarModal);

// Evento para cerrar el modal al hacer clic fuera de la imagen
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});



// ======================================
// Lógica para subir fotos a Google Drive
// ======================================

document.getElementById("uploadButton").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("status");
  
  // Validar si se seleccionaron archivos
  if (fileInput.files.length === 0) {
      status.innerText = "Por favor, selecciona al menos un archivo.";
      return;
  }

  // Validar el número de archivos seleccionados
  if (fileInput.files.length > 5) {
      status.innerText = "¡Recuerda que solo puedes subir un máximo de 5 archivos a la vez! :)";
      return;
  }

  // Validar si el tamaño total de los archivos es mayor al límite
  const totalSize = Array.from(fileInput.files).reduce((total, file) => total + file.size, 0);
  const maxSize = 60 * 1024 * 1024; // 60 MB en bytes
  if (totalSize > maxSize) {
      status.innerText = "¡El tamaño total de los archivos no debe superar los 50 MB!";
      return;
  }

  // Preparar la subida de archivos
  const formData = new FormData();
  Array.from(fileInput.files).forEach((file) => {
      formData.append("files", file);
  });

  // Mostrar mensaje de subida
  status.innerHTML = `
      <div class="status-container">
          <div class="loader"></div>
          <p>Subiendo archivos...</p>
      </div>
  `;

  try {
      // Llamar al endpoint de subida sin necesidad de token
      const response = await fetch("/upload-multiple", {
          method: "POST",
          body: formData
      });

      const result = await response.json();

      if (response.ok) {
          status.innerText = `¡${result.uploadedFiles.length} archivo(s) subido(s) exitosamente!`;
      } else {
          throw new Error(result.error || "Error en el servidor");
      }
  } catch (error) {
      status.innerText = `Error: ${error.message}`;
  }
});


// ======================================
// Lógica para confirmacion de asistencia
// ======================================

    // Selecciona el botón de confirmar (el enlace)
    const botonConfirmar = document.querySelector('.boton-confirmar');

    botonConfirmar.addEventListener('click', function(event) {
      // Si deseas ver la animación antes de redirigir, descomenta las dos líneas siguientes:
      event.preventDefault();
      setTimeout(() => window.open(botonConfirmar.href, '_blank'), 1500);

      // Lanza la animación de confeti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    });