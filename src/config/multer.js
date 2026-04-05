// src/config/multer.js
const multer = require('multer');
const path = require('path');

// Configuración del motor de almacenamiento
const storage = multer.diskStorage({
    // 1. Destino: ¿Dónde se guardarán las fotos?
    destination: (req, file, cb) => {
        // Las guardaremos en la carpeta pública para que el navegador pueda verlas
        cb(null, path.join(__dirname, '../../public/uploads')); 
    },
    // 2. Nombre del archivo: ¿Cómo se llamará?
    filename: (req, file, cb) => {
        // Generamos un nombre único: fecha + número aleatorio + extensión original
        // Ej: producto-16789999-444.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('No es una imagen! Por favor sube solo archivos jpg, jpeg o png.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por foto
});

module.exports = upload;