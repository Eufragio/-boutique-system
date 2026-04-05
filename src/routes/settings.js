// src/routes/settings.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const isAdmin = require('../middlewares/roleAuth');
const multer = require('multer');
const path = require('path');

// Configuración de Multer (Subida de imágenes)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Carpeta destino
    },
    filename: function (req, file, cb) {
        // Nombre único: logo-timestamp.jpg
        cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rutas (Solo Admin)
router.use(isAdmin);

router.get('/', settingsController.index);

// Agregamos middleware 'upload.single' para procesar el archivo 'logo'
router.post('/', upload.single('logo'), settingsController.update);

module.exports = router;