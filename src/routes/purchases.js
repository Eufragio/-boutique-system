// src/routes/purchases.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const isAdmin = require('../middlewares/roleAuth');

// Solo los Administradores pueden registrar compras
router.use(isAdmin);

router.get('/', purchaseController.index);       // Historial
router.get('/nueva', purchaseController.create); // Formulario
router.post('/', purchaseController.store);      // Guardar (AJAX)
router.get('/:id', purchaseController.show);     // Ver detalle

module.exports = router;