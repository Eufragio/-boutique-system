// src/routes/kardex.js
const express = require('express');
const router = express.Router();
const kardexController = require('../controllers/kardexController');
const isAuthenticated = require('../middlewares/auth');

// Ruta para ver el historial de un producto específico
// Ejemplo: /kardex/5
router.get('/:id', isAuthenticated, kardexController.show);

module.exports = router;