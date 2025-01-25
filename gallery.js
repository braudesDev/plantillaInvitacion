// Función para autenticar al usuario con Google
function authenticate() {
  return new Promise((resolve, reject) => {
      gapi.auth2.getAuthInstance().signIn().then(() => resolve(), reject);
  });
}

// Función para obtener los archivos (fotos) de Google Drive
function listFiles() {
  return new Promise((resolve, reject) => {
      gapi.client.drive.files.list({
          q: "mimeType='image/jpeg' and '1IyqopnWOc8z7xkWwBnElq4MRTGrm8oAJ'",  // Reemplaza 'YOUR_FOLDER_ID' con tu ID de carpeta en Google Drive
          orderBy: "modifiedTime desc",  // Ordenar por fecha de modificación
          pageSize: 9,  // Limitar a las 9 imágenes más recientes
          fields: "nextPageToken, files(id, name, webViewLink)"
      }).then(response => {
          resolve(response.result.files); // Devuelve los archivos obtenidos
      }, reject);
  });
}

// Función para cargar las imágenes en el contenedor de la página
function loadImages() {
  authenticate().then(() => {
      return listFiles();
  }).then(files => {
      const gallery = document.getElementById('gallery');  // Obtener el contenedor de la galería
      gallery.innerHTML = ''; // Limpiar el contenido previo
      files.forEach(file => {
          const imgElement = document.createElement('img');  // Crear una etiqueta <img>
          imgElement.src = `https://drive.google.com/uc?export=view&id=${file.id}`;  // Usar el enlace directo a la imagen
          imgElement.alt = file.name;  // Establecer el nombre de la imagen como alt
          imgElement.title = file.name;  // Establecer el nombre de la imagen como título
          gallery.appendChild(imgElement);  // Añadir la imagen al contenedor
      });
  }).catch(error => {
      console.error('Error al obtener las imágenes:', error);  // Manejo de errores
  });
}

// Cargar las imágenes cuando la página esté lista
window.onload = loadImages;
