// src/routes/clients.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const isAdmin = require('../middlewares/roleAuth');

// Listar
router.get('/', clientController.index);

// Crear
router.get('/crear', clientController.create);
router.post('/', clientController.store);

// Editar (Solo Admin)
router.get('/editar/:id', isAdmin, clientController.edit);
router.post('/editar/:id', isAdmin, clientController.update);

// Eliminar (Solo Admin)
router.post('/eliminar/:id', isAdmin, clientController.delete);

// NUEVO: Perfil del Cliente (CRM) - Debe ir al final para no confundir IDs con acciones
router.get('/:id', clientController.show);

module.exports = router;