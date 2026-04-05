// src/routes/expenses.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const isAdmin = require('../middlewares/roleAuth'); // Solo admin puede borrar

// Listar y Crear (Cualquier empleado puede registrar un gasto, ej: pasajes)
router.get('/', expenseController.index);
router.post('/', expenseController.store);

// Eliminar (Solo Admin)
router.post('/eliminar/:id', isAdmin, expenseController.delete);

module.exports = router;