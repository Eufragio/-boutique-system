// src/routes/suppliers.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const isAdmin = require('../middlewares/roleAuth'); // Solo admin gestiona proveedores

// Proteger todas las rutas, solo Admin debe ver proveedores
router.use(isAdmin);

router.get('/', supplierController.index);
router.get('/crear', supplierController.create);
router.post('/', supplierController.store);
router.get('/editar/:id', supplierController.edit);
router.post('/editar/:id', supplierController.update);
router.post('/estado/:id', supplierController.toggle);

module.exports = router;