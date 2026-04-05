// src/routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const isAdmin = require('../middlewares/roleAuth');

// Todo el módulo de reportes debe ser solo para Administradores
router.use(isAdmin);

router.get('/', reportController.index);
router.get('/ventas', reportController.exportSales);
router.get('/inventario', reportController.exportInventory);

module.exports = router;