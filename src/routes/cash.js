// src/routes/cash.js
const express = require('express');
const router = express.Router();
const cashController = require('../controllers/cashController');
const isAuthenticated = require('../middlewares/auth');

// Todas requieren estar logueado
router.use(isAuthenticated);

// Abrir Caja
router.get('/apertura', cashController.showOpen);
router.post('/apertura', cashController.processOpen);

// Cerrar Caja
router.get('/cierre', cashController.showClose);
router.post('/cierre', cashController.processClose);

// Historial (Opcional)
router.get('/historial', cashController.history);

module.exports = router;