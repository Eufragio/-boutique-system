// src/routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const isAdmin = require('../middlewares/roleAuth'); // Solo Admin gestiona esto

// Aplicamos seguridad a todo el módulo
router.use(isAdmin);

router.get('/', categoryController.index);
router.post('/', categoryController.store);
router.get('/editar/:id', categoryController.edit);
router.post('/editar/:id', categoryController.update);
router.post('/estado/:id', categoryController.toggleStatus);

module.exports = router;