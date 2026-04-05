// src/routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAdmin = require('../middlewares/roleAuth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rutas Públicas (o lectura general)
router.get('/', productController.index);

// NUEVA RUTA: Generador de Etiquetas (Accesible para cualquiera con acceso a productos)
router.get('/etiquetas/:id', productController.printBarcodes);

// Rutas Protegidas (Solo Admin)
router.get('/crear', isAdmin, productController.create);
router.post('/', isAdmin, upload.single('imagen'), productController.store);

router.get('/editar/:id', isAdmin, productController.edit);
router.post('/editar/:id', isAdmin, upload.single('imagen'), productController.update);

router.post('/estado/:id', isAdmin, productController.toggle);

module.exports = router;