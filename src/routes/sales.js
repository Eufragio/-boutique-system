// src/routes/sales.js
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const isAdmin = require('../middlewares/roleAuth');

// 1. Pantalla del POS (Debe ir primero para no confundirse con IDs)
router.get('/nueva', saleController.create);

// 2. Procesar venta
router.post('/', saleController.store);

// 3. EXPORTAR EXCEL (¡IMPORTANTE! Debe ir ANTES de '/:id')
// Si pones esto después, el sistema pensará que "exportar" es un ID de venta.
router.get('/exportar', saleController.export);

// 4. Ver Recibo (Esta ruta captura cualquier cosa, ej: /ventas/1, /ventas/100)
router.get('/:id', saleController.show);

// 5. Historial de Ventas (Ruta base /ventas)
router.get('/', saleController.index);

// 6. Anular Venta (Solo Admin)
router.post('/anular/:id', isAdmin, saleController.cancel);

module.exports = router;